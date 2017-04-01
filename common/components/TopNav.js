import React from 'react';
import IndexLink from 'react-router/lib/IndexLink';
import Link from 'react-router/lib/Link';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import { StyleSheet, css } from 'aphrodite';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import { deepOrange600, red700, white, yellow400, grey900 } from 'material-ui/styles/colors';
import PeopleIcon from 'material-ui/svg-icons/social/people';
import RaisedButton from 'material-ui/RaisedButton';
import { Toolbar, ToolbarGroup, ToolbarSeparator } from 'material-ui/Toolbar';
import SettingsDialog from './SettingsDialog';
import NotificationsDialog from './NotificationsDialog';
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
      opacity: 0.6,
    },
  },
  activeLink: {
    color: '#000',
  },
  feedName: {
    fontSize: 30,
    marginTop: -40,
  },
  feedDescription: {
    fontSize: 14,
  },
  numMembers: {
    fontSize: 14,
    textDecoration: 'underline',
    marginTop: -40,
    marginLeft: 10,
  },
});

export default class TopNav extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      value: 2,
    };
    this.currentFeedName = props.currentFeedName || "No feed name given";
    this.subscribed = props.subscribed || false;
    this.numFeedMembers = props.numFeedMembers || 0;
    this.numNotifications = props.numNotifications || 0;
  }

  handleChange = (event, index, value) => this.setState({ value });

  render() {
    let subButton = null;
    if (this.subscribed) {
      subButton = <RaisedButton label="unsubscribe" backgroundColor={red700} style={{ margin: 20, marginTop: -20 }} />
    } else {
      subButton = <RaisedButton label="subscribe" backgroundColor={yellow400} labelColor={grey900} style={{ marginBottom: 20, marginTop: -20 }} />
    }
    return (
      <MuiThemeProvider muiTheme={muiTheme}>
        <Toolbar style={{ height: 90, top: 0, left: 0, width: '100%', position: 'fixed', zIndex: 200, color: white, fontFamily: 'Roboto, sans-serif' }}>
          <ToolbarGroup>
            <span className={css(styles.feedName)}>{this.currentFeedName}</span>
            {subButton}
            <PeopleIcon style={{ marginTop: -40 }} />
            <span className={css(styles.numMembers)}>{this.numFeedMembers} members</span>
            {/* need to turn 8 into a prop */}
            {/* <p className={css(styles.feedDescription)}>Description for the group</p> */}
          </ToolbarGroup>
          <ToolbarGroup>
            <NotificationsDialog
              numNotifications={this.numNotifications}
            />
            <SettingsDialog />
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
