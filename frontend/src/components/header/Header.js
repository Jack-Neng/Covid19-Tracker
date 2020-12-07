import React, { Component } from "react";
import {
  Navbar,
  Nav,
  NavDropdown,
  Form,
  FormControl,
  Button,
} from "react-bootstrap";
import { Link } from "react-router-dom";

export class Header extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <Navbar bg="light" expand="lg" className="d-flex justify-content-between">
        <Nav>
          <Navbar.Brand>Covid-19 Tracker</Navbar.Brand>
          <Nav.Link href="/canada">Canada</Nav.Link>
          <Nav.Link href="/global">Global</Nav.Link>
        </Nav>
      </Navbar>
    );
  }
}

export default Header;
