import React from 'react';
import IndexLink from 'react-router/lib/IndexLink';
import Link from 'react-router/lib/Link';
import { StyleSheet, css } from 'aphrodite';
import IconButton from 'material-ui/IconButton';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import {
  deepOrange600,
  blueGrey700,
  red700,
  teal200,
  grey100, grey300, grey500, grey900,
  cyan500,
  white, darkBlack, fullBlack,
} from 'material-ui/styles/colors';
import { fade } from 'material-ui/utils/colorManipulator';
import PeopleIcon from 'material-ui/svg-icons/social/people';
import SettingsIcon from 'material-ui/svg-icons/action/settings';
import MenuItem from 'material-ui/MenuItem';
import DropDownMenu from 'material-ui/DropDownMenu';
import RaisedButton from 'material-ui/RaisedButton';
import { Toolbar, ToolbarGroup, ToolbarSeparator } from 'material-ui/Toolbar';
import Badge from 'material-ui/Badge';
import NotificationsIcon from 'material-ui/svg-icons/social/notifications';
import Search from './Search';

const muiTheme = getMuiTheme({
  fontFamily: 'Roboto, sans-serif',
  palette: {
    accent1Color: red700,
    accent2Color: deepOrange600,
    textColor: white,
  },
});

const styles = StyleSheet.create({
  link: {
    maxWidth: 700,
    color: '#999',
    margin: '1.5rem 1rem 1.5rem 0',
    display: 'inline-block',
    textDecoration: 'none',
    fontWeight: 'bold',
    transition: '.2s opacity ease',
    ':hover': {
      opacity: 0.6
    }
  },
  activeLink: {
    color: '#000'
  },
  feedName: {
    fontSize: 30,
    marginTop: -40
  },
  feedDescription: {
    fontSize: 14
  },
  numMembers : {
    fontSize: 14,
    textDecoration: 'underline',
    marginTop: -40,
    marginLeft: 10
  }
})

export default class TopNav extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      value: 2,
    };
  }

  handleChange = (event, index, value) => this.setState({ value });

  render() {
    return (
      <MuiThemeProvider muiTheme={muiTheme}>
        <Toolbar style={{ height: 90, top: 0, left: 0, width: '100%', position: 'fixed', zIndex: 200, color: white, fontFamily: 'Roboto, sans-serif' }}>
          <ToolbarGroup>
            <span className={css(styles.feedName)}>Name of the group</span>
            <RaisedButton label="unsubscribe" secondary={true} style={{ margin: 20, marginTop: -20 }} />
            <PeopleIcon style={{ marginTop: -40 }} />
            <span className={css(styles.numMembers)}>8 members</span>
            {/* need to turn 8 into a prop */}
            {/* <p className={css(styles.feedDescription)}>Description for the group</p> */}
          </ToolbarGroup>
          <ToolbarGroup>
            <Badge
              badgeContent={10}
              secondary={true}
              badgeStyle={{ top: 12, right: 12 }}
            >
              <IconButton tooltip="Notifications">
                <NotificationsIcon hoverColor={grey300} />
              </IconButton>
            </Badge>
            <IconButton tooltip="Settings">
              <SettingsIcon hoverColor={grey300} />
            </IconButton>
            <ToolbarSeparator />
            <Search />
            <IndexLink to="/" className={css(styles.link)} activeClassName={css(styles.link, styles.activeLink)}>
              Home
            </IndexLink>
            <Link to="/posts" className={css(styles.link)} activeClassName={css(styles.link, styles.activeLink)}> Example Feed
            </Link>
          </ToolbarGroup>
        </Toolbar>
      </MuiThemeProvider>
    );
  }
}
