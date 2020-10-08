/**
 * @author: iceman
 * @date: 2020/10/5.
 */

let RENDER_TO_DOM = Symbol('render_to_dom');

const isSameNode = (oldNode, newNode) => {
	if (oldNode.type !== newNode.type) {
		return false;
	}
	
	for (let name in newNode.props) {
		if (newNode.props[name] !== oldNode.props[name]) {
			return false;
		}
	}
	
	if (Object.keys(oldNode.props).length > Object.keys(newNode.props).length) {
		return false;
	}
	
	if (newNode.type === '#text') {
		if (newNode.content !== oldNode.content) {
			return false;
		}
	}
	
	return true;
};

const updateVDom = (oldNode, newNode) => {
	if (!isSameNode(oldNode, newNode)) {
		newNode[RENDER_TO_DOM](oldNode._range);
		return;
	}
	newNode._range = oldNode._range;
	
	let newChildren = newNode.vChildren;
	let oldChildren = oldNode.vChildren;
	
	if (!newChildren || !newChildren.length) {
		return;
	}
	
	const oldChildrenLength = oldChildren.length;
	let tailRange = oldChildren[oldChildrenLength - 1]._range;
	
	for(let i = 0; i < newChildren.length; i++) {
		let newChild = newChildren[i];
		let oldChild = oldChildren[i];
		
		if (i < oldChildrenLength) {
			updateVDom(oldChild, newChild);
		} else {
			let range = document.createRange();
			range.setStart(tailRange.endContainer, tailRange.endOffset);
			range.setEnd(tailRange.endContainer, tailRange.endOffset);
			newChild[RENDER_TO_DOM](range);
			tailRange = range;
		}
	}
};

const replaceContent = (range, node) => {
	range.insertNode(node);
	range.setStartAfter(node);
	range.deleteContents();
	
	range.setStartBefore(node);
	range.setEndAfter(node);
};

export class Component {
	constructor() {
		this.props = Object.create(null);
		this.children = [];
		this._range = null;
		// this.state = null;
	}
	
	setAttribute(name, value) {
		this.props[name] = value;
	}
	
	appendChild(component) {
		component && this.children.push(component);
	}
	
	get vDom() {
		return this.render().vDom;
	}
	
	[RENDER_TO_DOM](range) {
		this._range = range;
		this._vDom = this.vDom;
		this._vDom[RENDER_TO_DOM](range);
	}
	
	update() {
		let vDom = this.vDom;
		updateVDom(this._vDom, vDom);
		this._vDom = vDom;
	}
	
	// reRender() {
	// 	let oldRange = this._range;
	//
	// 	let range = document.createRange();
	// 	range.setStart(oldRange.startContainer, oldRange.startOffset);
	// 	range.setEnd(oldRange.startContainer, oldRange.startContainer);
	// 	this[RENDER_TO_DOM](range);
	//
	// 	oldRange.setStart(range.endContainer, range.endOffset);
	// 	oldRange.deleteContents();
	// }
	
	setState(newState) {
		if (this.state === null && typeof this.state !== 'object') {
			this.state = newState;
			this.update();
			return;
		}
		
		let merge = (oldState, newState) => {
			for (let property in newState) {
				if (oldState[property] === null
					|| typeof oldState[property] !== 'object') {
					oldState[property] = newState[property];
				} else {
					merge(oldState[property], newState[property]);
				}
			}
		};
		
		// 这里直接merge 后能改变，
		// 是因为对象类型是引用类型
		merge(this.state, newState);
		this.update();
	}
}


class ElementWrapper extends Component{
	constructor(type) {
		super(type);
		this.type = type;
	}

	//
	// setAttribute(name, value) {
	// 	if (name.match(/^on([\s\S]+)$/)) {
	// 		this.root.addEventListener(RegExp.$1.replace(/^([\s\S])/, text => text.toLowerCase()), value);
	// 	} else if (name === 'className') {
	// 		this.root.setAttribute('class', value);
	// 	} else {
	// 		this.root.setAttribute(name, value);
	// 	}
	// }
	//
	// appendChild(component) {
	// 	let range = document.createRange();
	// 	range.setStart(this.root, this.root.childNodes.length);
	// 	range.setEnd(this.root, this.root.childNodes.length);
	// 	component[RENDER_TO_DOM](range);
	// }
	
	get vDom() {
		this.vChildren = this.children.map(child => child.vDom);
		return this;
	}
	
	[RENDER_TO_DOM](range) {
		this._range = range;
		
		let root = document.createElement(this.type);
		
		for (let name in this.props) {
			let value = this.props[name];
			if (name.match(/^on([\s\S]+)$/)) {
				root.addEventListener(RegExp.$1.replace(/^([\s\S])/, text => text.toLowerCase()), value);
			} else if (name === 'className') {
				root.setAttribute('class', value);
			} else {
				root.setAttribute(name, value);
			}
		}
		
		if (!this.vChildren) {
			this.vChildren = this.children.map(child => child.vDom);
		}
		
		for (let child of this.vChildren) {
			let childRange = document.createRange();
			childRange.setStart(root, root.childNodes.length);
			childRange.setEnd(root, root.childNodes.length);
			child[RENDER_TO_DOM](childRange);
		}
		
		
		replaceContent(range, root);
	}
}

class TextWrapper extends Component{
	constructor(content) {
		super(content);
		this.type = '#text';
		this.content = content;
	}
	
	get vDom() {
		return this;
	}
	
	[RENDER_TO_DOM](range) {
		this._range = range;
		
		let root = document.createTextNode(this.content);
		replaceContent(range, root);
	}
}

export function createElement(type, attributes, ...children) {
	let ele;
	if (typeof type === 'string') {
		ele = new ElementWrapper(type);
	} else {
		// jsx 会将自定义组件当成对象传入
		// 所以需要区分处理
		ele = new type();
	}

	for (let p in attributes) {
		ele.setAttribute(p, attributes[p]);
	}
	
	let insertChildren = (children) => {
		for (let child of children) {
			if (typeof child === 'string') {
				child = new TextWrapper(child);
			}
			if (child === null) {
				continue;
			}
			if ((typeof child === 'object') && (child instanceof Array)) {
				insertChildren(child);
			} else {
				ele.appendChild(child);
			}
		}
	};
	
	insertChildren(children);
	
	return ele;
}

export function render(component, parentElement) {
	let range = document.createRange();
	
	range.setStart(parentElement, 0);
	range.setEnd(parentElement, parentElement.childNodes.length);
	range.deleteContents();
	component[RENDER_TO_DOM](range);
}
