import React from 'react';
import { StyleSheet, css } from 'aphrodite';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import { deepOrange600, blueGrey700, red700, cyan500, white, blue500 } from 'material-ui/styles/colors';
import Drawer from 'material-ui/Drawer';
import MenuItem from 'material-ui/MenuItem';
import { List, ListItem } from 'material-ui/List';
import ActionInfo from 'material-ui/svg-icons/action/info';
import Subheader from 'material-ui/Subheader';
import Avatar from 'material-ui/Avatar';
import FileFolder from 'material-ui/svg-icons/file/folder';
import ActionAssignment from 'material-ui/svg-icons/action/assignment';
// import EditorInsertChart from 'material-ui/svg-icons/editor/insert-chart';
import HourglassIcon from 'material-ui/svg-icons/action/hourglass-empty';


const muiTheme = getMuiTheme({
  fontFamily: 'Roboto, sans-serif',
  palette: {
    accent1Color: red700,
    accent2Color: deepOrange600,
    textColor: white,
    primaryText: white,
    secondaryText: white,
  },
  userAgent: (typeof navigator !== 'undefined' && navigator.userAgent) || 'all',
});

const styles = StyleSheet.create({
  subheaderInset: {
    color: white,
    fontSize: 24,
  },
  drawer: {
    top: 90,
    left: 0,
    position: 'fixed',
    zIndex: '180',
    color: white,
    fontFamily: 'Roboto, sans-serif',
  },
});

export default class LeftNav extends React.Component {

  constructor(props) {
    super(props);
    this.groupList = props.groupList;
  }

  render() {
    return (
      <MuiThemeProvider muiTheme={muiTheme}>
        <div>
          <Drawer docked width={350} containerStyle={{ backgroundColor: blueGrey700 }} className={css(styles.drawer)}>
            <MenuItem>Hidden 1</MenuItem>
            <MenuItem>Hidden 2</MenuItem>
            <List>
              <Subheader inset style={{ color: white, fontSize: 30 }}>Groups</Subheader>
              <ListItem
                leftAvatar={<Avatar icon={<HourglassIcon />} />}
                rightIcon={<ActionInfo color={white} />}
                primaryText="Group 1"
              />
              <ListItem
                leftAvatar={<Avatar icon={<FileFolder />} />}
                rightIcon={<ActionInfo />}
                primaryText="Group 2"
              />
              <ListItem
                leftAvatar={<Avatar icon={<ActionAssignment />} />}
                rightIcon={<ActionInfo />}
                primaryText="Group 3"
              />
            </List>
            {/* <Divider /> */}
            <List>
              <Subheader inset style={{ color: white, fontSize: 30 }}>Personal</Subheader>
              <ListItem
                leftAvatar={<Avatar icon={<ActionAssignment />} backgroundColor={blue500} />}
                rightIcon={<ActionInfo />}
                primaryText="Group 4"
              />
            </List>
            <List>
              <Subheader inset style={{ color: white, fontSize: 30 }}>Explore</Subheader>
              <ListItem
                leftAvatar={<Avatar icon={<ActionAssignment />} backgroundColor={red700} />}
                rightIcon={<ActionInfo />}
                primaryText="Explore 1"
              />
              <ListItem
                leftAvatar={<Avatar icon={<ActionAssignment />} backgroundColor={red700} />}
                rightIcon={<ActionInfo />}
                primaryText="Explore 2"
              />
            </List>
            <List>
              <Subheader inset style={{ color: white, fontSize: 30 }}>People You Follow</Subheader>
              <ListItem
                leftAvatar={<Avatar icon={<ActionAssignment />} backgroundColor={cyan500} />}
                rightIcon={<ActionInfo />}
                primaryText="Person 1"
              />
              <ListItem
                leftAvatar={<Avatar icon={<ActionAssignment />} backgroundColor={cyan500} />}
                rightIcon={<ActionInfo />}
                primaryText="Person 2"
              />
            </List>
          </Drawer>
        </div>
      </MuiThemeProvider>
    );
  }
}
