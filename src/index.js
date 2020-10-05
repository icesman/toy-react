import {
	createElement,
	Component,
	render
} from './toy-react';

class HelloWorld extends Component {
	render() {
		return (
			<div>
				<h1>Hello world!</h1>
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