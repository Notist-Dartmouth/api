import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import injectTapEventPlugin from 'react-tap-event-plugin';
// import MyComponent from './components/component_one';
// import MyCard from './components/my_card';
import ToolbarExample from './components/toolbar-example';
import DrawerSimpleExample from './components/drawer-simple-example';
import CardExampleExpandable from './components/card-example-expandable';

injectTapEventPlugin();

class App extends Component {
  constructor(props) {
  super(props);

  }
  render() {
    return (
      <div>
        <div id="toolbar">
          <ToolbarExample />
        </div>
        <div id="card">
          <CardExampleExpandable />
        </div>
        <div id="leftdrawer">
          <DrawerSimpleExample />
        </div>
      </div>
    );
  }
}

ReactDOM.render(<App />, document.getElementById('main'));
