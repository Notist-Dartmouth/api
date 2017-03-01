import React, {Component} from 'react';
import RaisedButton from 'material-ui/RaisedButton';
import Dialog from 'material-ui/Dialog';
import {
  deepOrange600,
  blueGrey700,
  teal200,
  grey100, grey300, grey400, grey500, grey900,
  cyan500,
  white, darkBlack, fullBlack,
} from 'material-ui/styles/colors';
import FlatButton from 'material-ui/FlatButton';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import {fade} from 'material-ui/utils/colorManipulator';

import Card from 'material-ui/Card';

// Card.defaultProps = {
//   expandable: true,
//   expanded: true,
//   initiallyExpanded: true
// };

const styles = {
  container: {
    textAlign: 'center',
    paddingTop: 200,
  },
};

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

class MyCard extends Component {
  constructor(props, context) {
    super(props, context);

    this.state = {
      open: false,
    };
  }


  render() {
    const standardActions = (
      <FlatButton
        label="Ok"
        primary={true}
      />
    );

    return (
      <MuiThemeProvider muiTheme={muiTheme}>
        <div style={styles.container}>
          <Dialog
            open={this.state.open}
            title="Dialog text"
            actions={standardActions}
            onRequestClose={this.handleRequestClose}
          >
            555
          </Dialog>
          <h1>Material-UI</h1>
          <h2>example project</h2>
          <RaisedButton
            label="Button label"
            secondary={true}
          />
          <Card />
        </div>
      </MuiThemeProvider>
    );
  }
}

export default MyCard;
