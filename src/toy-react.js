/**
 * @author: iceman
 * @date: 2020/10/5.
 */

class ElementWrapper {
	constructor(type) {
		this.root = document.createElement(type);
	}
	
	setAttribute(name, value) {
		this.root.setAttribute(name, value);
	}
	
	appendChild(component) {
		component && this.root.appendChild(component.root);
	}
}

class TextWrapper {
	constructor(content) {
		this.root = document.createTextNode(content);
	}
}

export class Component {
	constructor() {
		this.props = Object.create(null);
		this.children = [];
		this._root = null;
	}
	
	setAttribute(name, value) {
		this.props[name] = value;
	}
	
	appendChild(component) {
		component && this.children.push(component);
	}
	
	get root() {
		if (!this._root) {
			// 会发生递归
			this._root = this.render().root;
		}
		return this._root;
	}
}

export function createElement(type, attributes, ...children) {
	let ele;
	if (typeof type === 'string') {
		ele = new ElementWrapper(type);
	} else {
		// jsx 会将自定义组件当成对象传入
		// 所以需要区分处理
		ele = new type;
	}

	for (let p in attributes) {
		ele.setAttribute(p, attributes[p]);
	}
	
	let insertChildren = (children) => {
		for (let child of children) {
			if (typeof child === 'string') {
				child = new TextWrapper(child);
				ele.appendChild(child);
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
	parentElement.appendChild(component.root);
}
