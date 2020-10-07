import {
	createElement,
	Component,
	render
} from './toy-react';

class HelloWorld extends Component {
	constructor() {
		super();
		this.state = {
			a: 1,
			b: 2
		};
	}

	render() {
		return (
			<div>
				<h1>Hello world!</h1>
				<button onClick={() => this.setState({
					a: this.state.a + 1
				})}>plus</button>
				<div>{this.state.a.toString()}</div>
				{this.children}
			</div>
		);
	}
}

render(
	<HelloWorld id="a">
		<div>Hello world from children!</div>
		<div>a</div>
	</HelloWorld>,
	document.body
);