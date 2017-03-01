import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import injectTapEventPlugin from 'react-tap-event-plugin';
import {
  deepOrange400,
  blueGrey700,
  teal200,
  grey100, grey300, grey400, grey500, grey900,
  cyan500,
  white, darkBlack, fullBlack,
} from 'material-ui/styles/colors';
// https://www.materialui.co/colors
import {fade} from 'material-ui/utils/colorManipulator';
import spacing from 'material-ui/styles/spacing';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import Chip from 'material-ui/Chip';
import Drawer from 'material-ui/Drawer';
import MenuItem from 'material-ui/MenuItem';
import RaisedButton from 'material-ui/RaisedButton';
import IconButton from 'material-ui/IconButton';
import NavigationArrowBack from 'material-ui/svg-icons/navigation/arrow-back';
import Media from 'react-media';

injectTapEventPlugin();

const ARTICLEURL = 'http://www.theonion.com/article/trump-spends-entire-classified-national-security-b-53550';
const ARTICLETITLE = 'Trump Spends Entire Classified National Security Briefing Asking About ​Egyptian ​Mummies';
const ARTICLEPUBLISHER = 'The Onion (satire)';
const NAVBARHEIGHT = '75px';
const DEFAULTWIDTH = '380px';
const MINSIDEBARWIDTH = '380px';

const ANNOTATIONS = {
  Mark: {
    text: 'Lorem Ipsum',
  },
};
  //  Maybe this should be an array of arrays of strings?

//  CSS for components
const styles = {
  title: {
    zIndex: 100,
    fontSize: 36,
  },

  backNav: {
    width: '100px',
  },

  navBar: {
    width: '100%',
    height: NAVBARHEIGHT,
    position: 'fixed',
    backgroundColor: deepOrange400,
  },

  iframeContainer: {
    height: '55%',
    paddingLeft: '25px',
    paddingRight: '25px',
  },

  iframe: {
    border: 'rgba(255, 255, 255, 1)',  // Transparent
    height: '100%',
    minWidth: '330px',
    backgroundColor: 'rgba(255, 255, 255, 1)',  // Transparent
  },

  iconContainer: {
    height: NAVBARHEIGHT,
  },

  sideBarText: {
    fontSize: 16,
    paddingLeft: '25px',
    paddingRight: '25px',
  },

  sideBar: {
    position: 'fixed',
    backgroundColor: blueGrey700,
    width: '380px',
    minWidth: '380px',
    height: '100%',
    top: NAVBARHEIGHT,
    right: '0px',
  },
};

// not currently being rendered -- needs to for group / feed view
class SimpleDrawer extends Component {

  constructor(props) {
    super(props);
    this.state = { open: false };
  }

  handleToggle = () => this.setState({ open: !this.state.open });

  render() {
    return (
      <div>
        <RaisedButton
          label="Toggle Drawer"
          onTouchTap={this.handleToggle}
        />
        <Drawer open={this.state.open}>
          <MenuItem>Menu Item</MenuItem>
          <MenuItem>Menu Item 2</MenuItem>
        </Drawer>
      </div>
    );
  }
}

const otherStyles = {
  smallIcon: {
    width: 36,
    height: 36,
  },
  small: {
    width: 72,
    height: 72,
    padding: 0,
  },
};

const IconButtonExampleSize = () => (
  <div>
    <IconButton
      iconStyle={otherStyles.smallIcon}
      style={otherStyles.small}
    >
      <NavigationArrowBack />
    </IconButton>
  </div>
);

class ChipExampleArray extends React.Component {

  constructor(props) {
    super(props);
    this.state = { chipData: [
      { key: 0, label: 'politics' },
      { key: 1, label: '@cblanc' },
      { key: 2, label: 'X' },
      { key: 3, label: 'Y' },
    ] };
    this.styles = {
      chip: {
        margin: 4,
      },
      wrapper: {
        display: 'flex',
        flexWrap: 'wrap',
      },
    };
  }

  handleRequestDelete = (key) => {
    if (key === 3) {
      alert('Are you sure you want to delete _?');
      return;
    }

    this.chipData = this.state.chipData;
    const chipToDelete = this.chipData.map((chip) => chip.key).indexOf(key);
    this.chipData.splice(chipToDelete, 1);
    this.setState({ chipData: this.chipData });
  };

  renderChip(data) {
    return (
      <Chip
        key={data.key}
        onRequestDelete={() => this.handleRequestDelete(data.key)}
        style={this.styles.chip}
      >
        {data.label}
      </Chip>
    );
  }

  render() {
    return (
      <div style={this.styles.wrapper}>
        {this.state.chipData.map(this.renderChip, this)}
      </div>
    );
  }
}

class NavBar extends Component {
  render() {
    return (
      <div style={styles.navBar}>
        <div className="iconContainer" style={styles.iconContainer}>
          <IconButtonExampleSize />
          <p>Back</p>
        </div>
        <p style={styles.title}>{ARTICLETITLE}</p>
      </div>
    );
  }
}

class SideBar extends Component {
  render() {
    return (
      <div id="sideBar" style={styles.sideBar}>
        <p style={styles.sideBarText}>At a glance:</p>
        <div className="iframeContainer" style={styles.iframeContainer}>
          <iframe src={ARTICLEURL} style={styles.iframe}></iframe>
        </div>
        <p style={styles.sideBarText}>Filters:</p>
        <ChipExampleArray />
      </div>
    );
  }
}

class App extends Component {

  render() {
    return (
      <div>
        <MuiThemeProvider>
          <Media query="(min-width: 1200px)" render={() => (
            <SideBar /> //  Only show if user's screen is big enough
          )} />
        </MuiThemeProvider>
        <MuiThemeProvider>
          <NavBar />
        </MuiThemeProvider>
      </div>
    );
  }
}

ReactDOM.render(<App />, document.getElementById('main'));
