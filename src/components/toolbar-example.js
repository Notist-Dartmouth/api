import React from 'react';
import IconMenu from 'material-ui/IconMenu';
import IconButton from 'material-ui/IconButton';
import FontIcon from 'material-ui/FontIcon';
import NavigationExpandMoreIcon from 'material-ui/svg-icons/navigation/expand-more';
import MenuItem from 'material-ui/MenuItem';
import DropDownMenu from 'material-ui/DropDownMenu';
import RaisedButton from 'material-ui/RaisedButton';
import AutoComplete from 'material-ui/AutoComplete';
import SocialPersonOutline from 'react-material-icons/icons/social/person-outline';
import {Toolbar, ToolbarGroup, ToolbarSeparator, ToolbarTitle} from 'material-ui/Toolbar';
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

export default class ToolbarExample extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      value: 1,
      dataSource: [],
    };
  }

  handleChange = (event, index, value) => this.setState({value});

  render() {
    return (
      <MuiThemeProvider muiTheme={muiTheme}>
        <Toolbar>
          <ToolbarGroup firstChild={true}>
            <DropDownMenu value={this.state.value} onChange={this.handleChange}>
              <MenuItem value={1} primaryText="Notist 8 Users" />
            </DropDownMenu>
            <SocialPersonOutline />
          </ToolbarGroup>
          <ToolbarGroup>
            <ToolbarTitle text="A notebook for sharing what we're reading." />
            <FontIcon className="muidocs-icon-custom-sort" />
            <ToolbarSeparator />
            <AutoComplete hintText="Search"
            dataSource={this.state.dataSource}
            primary={true}
            />
            <IconMenu
              iconButtonElement={
                <IconButton touch={true}>
                  <NavigationExpandMoreIcon />
                </IconButton>
              }
            >
              <MenuItem primaryText="Account Settings" />
              <MenuItem primaryText="View Settings" />
              <MenuItem primaryText="Notebook Settings" />
            </IconMenu>
          </ToolbarGroup>
        </Toolbar>
      </MuiThemeProvider>
    );
  }
}
