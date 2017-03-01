import React from 'react';
import Drawer from 'material-ui/Drawer';
import MenuItem from 'material-ui/MenuItem';
import RaisedButton from 'material-ui/RaisedButton';
import {
  deepOrange600,
  blueGrey700,
  teal200,
  grey100, grey300, grey400, grey500, grey900,
  cyan500,
  white, darkBlack, fullBlack,
} from 'material-ui/styles/colors';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import {fade} from 'material-ui/utils/colorManipulator';

const muiTheme = getMuiTheme({
  palette: {
    primary1Color: deepOrange600,
    primary2Color: blueGrey700,
    primary3Color: teal200,
    accent1Color: grey900,
    accent2Color: grey100,
    accent3Color: grey500,
    textColor: darkBlack,
    alternateTextColor: white,
    canvasColor: white,
    borderColor: grey300,
    disabledColor: fade(darkBlack, 0.3),
    pickerHeaderColor: cyan500,
    clockCircleColor: fade(darkBlack, 0.07),
    shadowColor: fullBlack,
  },
});

export default class DrawerSimpleExample extends React.Component {

  constructor(props) {
    super(props);
    this.state = {open: false};
  }

  handleToggle = () => this.setState({open: !this.state.open});

  handleClose = () => this.setState({open: false});


render() {
    return (
      <MuiThemeProvider muiTheme={muiTheme}>
        <div>
          <RaisedButton
            label="Open Drawer"
            onTouchTap={this.handleToggle}
          />
          <Drawer
            docked={true}
            width={300}
            open={this.state.open}
            onRequestChange={(open) => this.setState({open})}
          >
            <MenuItem onTouchTap={this.handleClose}>Close Drawer</MenuItem>
          </Drawer>
        </div>
      </MuiThemeProvider>
    );
  }
}
