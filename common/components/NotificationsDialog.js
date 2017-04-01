/* I'm being a bad dude and disabling some eslint rules on a per file basis -- Byrne */
/* eslint-disable no-unused-vars */

import React from 'react';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import { RadioButton, RadioButtonGroup } from 'material-ui/RadioButton';
import { StyleSheet, css } from 'aphrodite';
import NotificationsIcon from 'material-ui/svg-icons/social/notifications';
import { grey300, white, fullBlack } from 'material-ui/styles/colors';
import IconButton from 'material-ui/IconButton';
import Badge from 'material-ui/Badge';

const styles = StyleSheet.create({
  radioButton: {
    marginTop: 16,
  },
});

/**
 * Dialog content can be scrollable.
 */
export default class NotificationsDialog extends React.Component {
  constructor(props) {
    super(props);
    this.numNotifications = props.numNotifications;
  }

  state = {
    open: false,
  };

  handleOpen = () => {
    this.setState({ open: true });
  };

  handleClose = () => {
    this.setState({ open: false });
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
    for (let i = 0; i < 20; i += 1) {
      radios.push(
        <RadioButton
          key={i}
          value={`value${i + 1}`}
          label={`Option ${i + 1}`}
        />,
      );
    }

    return (
      <div>
        <Badge
          badgeContent={this.numNotifications}
          secondary
          badgeStyle={{ top: 12, right: 12 }}
        >
          <IconButton tooltip="Notifications" onTouchTap={this.handleOpen}>
            <NotificationsIcon color={white} hoverColor={grey300} />
          </IconButton>
        </Badge>
        <Dialog
          titleStyle={{ color: fullBlack }}
          title="Notifications"
          actions={actions}
          modal={false}
          open={this.state.open}
          onRequestClose={this.handleClose}
          autoScrollBodyContent
        >
          <p style={{ color: fullBlack }}>You have {this.numNotifications} new notifications</p>
          <RadioButtonGroup name="shipSpeed" defaultSelected="not_light">
            {radios}
          </RadioButtonGroup>

        </Dialog>
      </div>
    );
  }
}
