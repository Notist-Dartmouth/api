import React from 'react';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import {RadioButton, RadioButtonGroup} from 'material-ui/RadioButton';
import { StyleSheet, css } from 'aphrodite';
import SettingsIcon from 'material-ui/svg-icons/action/settings';
import { grey300, white, fullBlack } from 'material-ui/styles/colors';
import IconButton from 'material-ui/IconButton';

const styles = StyleSheet.create({
  radioButton: {
    textColor: fullBlack,
    marginTop: 16,
  },
})

/**
 * Dialog content can be scrollable.
 */
export default class SettingsDialog extends React.Component {
  state = {
    open: false,
  };

  handleOpen = () => {
    this.setState({open: true});
  };

  handleClose = () => {
    this.setState({open: false});
  };

  render() {
    const actions = [
      <FlatButton
        label="Cancel"
        primary
        onTouchTap={this.handleClose}
      />,
      <FlatButton
        label="Submit"
        primary
        keyboardFocused
        onTouchTap={this.handleClose}
      />,
    ];

    const radios = [];
    for (let i = 0; i < 20; i++) {
      radios.push(
        <RadioButton
          key={i}
          value={`value${i + 1}`}
          label={`Option ${i + 1}`}
          style={css(styles.radioButton)}
        />
      );
    }

    return (
      <div>
        <IconButton tooltip="Settings" onTouchTap={this.handleOpen}>
          <SettingsIcon color={white} hoverColor={grey300} />
        </IconButton>
        <Dialog
          titleStyle={{ color: fullBlack }}
          title="Settings"
          actions={actions}
          modal={false}
          open={this.state.open}
          onRequestClose={this.handleClose}
          autoScrollBodyContent
        >
          <p style={{ color: fullBlack }}>Some text</p>
{/*
  // they're white and I can't seem to fix it
  RadioButtonGroup name="shipSpeed" defaultSelected="not_light">
    {radios}
  </RadioButtonGroup>
  */}

        </Dialog>
      </div>
    );
  }
}
