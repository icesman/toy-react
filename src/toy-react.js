/**
 * @author: iceman
 * @date: 2020/10/5.
 */

let RENDER_TO_DOM = Symbol('render_to_dom');

class ElementWrapper {
	constructor(type) {
		this.root = document.createElement(type);
	}
	
	setAttribute(name, value) {
		if (name.match(/^on([\s\S]+)$/)) {
			this.root.addEventListener(RegExp.$1.replace(/^([\s\S])/, text => text.toLowerCase()), value);
		} else if (name === 'className') {
			this.root.setAttribute('class', value);
		} else {
			this.root.setAttribute(name, value);
		}
	}
	
	appendChild(component) {
		let range = document.createRange();
		range.setStart(this.root, this.root.childNodes.length);
		range.setEnd(this.root, this.root.childNodes.length);
		component[RENDER_TO_DOM](range);
	}
	
	[RENDER_TO_DOM](range) {
		range.deleteContents();
		range.insertNode(this.root);
	}
}

class TextWrapper {
	constructor(content) {
		this.root = document.createTextNode(content);
	}
	
	[RENDER_TO_DOM](range) {
		range.deleteContents();
		range.insertNode(this.root);
	}
}

export class Component {
	constructor() {
		this.props = Object.create(null);
		this.children = [];
		this._root = null;
		this._range = null;
		// todo: confirm if ok
		// this.state = null;
	}
	
	setAttribute(name, value) {
		this.props[name] = value;
	}
	
	appendChild(component) {
		component && this.children.push(component);
	}
	
	[RENDER_TO_DOM](range) {
		this._range = range;
		this.render()[RENDER_TO_DOM](range);
	}
	
	render() {}
	
	reRender() {
		let oldRange = this._range;
		
		let range = document.createRange();
		range.setStart(oldRange.startContainer, oldRange.startOffset);
		range.setEnd(oldRange.startContainer, oldRange.startContainer);
		this[RENDER_TO_DOM](range);
		
		oldRange.setStart(range.endContainer, range.endOffset);
		oldRange.deleteContents();
	}
	
	setState(newState) {
		if (this.state === null && typeof this.state !== 'object') {
			this.state = newState;
			this.reRender();
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
		this.reRender();
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
