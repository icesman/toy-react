import {
	createElement,
	Component,
	render
} from './toy-react';

class HelloWorld extends Component {
	render() {
		console.log(this.clildren);
		return (
			<div>
				<h1>Hello world!</h1>
				{this.children}
			</div>
		);
	}
}

render(
	<HelloWorld>
		<div>Hello world from children!</div>
	</HelloWorld>,
	document.body
);