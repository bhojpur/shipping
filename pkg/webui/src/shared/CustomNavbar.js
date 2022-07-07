// Copyright (c) 2018 Bhojpur Consulting Private Limited, India. All rights reserved.

// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:

// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

import React from 'react';
import {Navbar, Nav} from 'react-bootstrap';
import {NavLink, withRouter} from 'react-router-dom';
import {LinkContainer} from 'react-router-bootstrap';
import {getNavbarLinksForUser} from '../utils/getNavbarLinksForUser';
import authService from '../service/AuthService';

const CustomNavbar = ({currentUser, history, onSetCurrentUser}) => {
  const userLinks = getNavbarLinksForUser(currentUser);
  const handleLogout = () => {
    authService.logOut();
    onSetCurrentUser(null);
    history.push('/');
  };

  return (
    <Navbar bg="dark" variant="dark" className="mb-2">
      <LinkContainer to="/"><Navbar.Brand>Bhojpur Shipping</Navbar.Brand></LinkContainer>
      <Nav className="mr-auto">
        {userLinks.map(({to, name}, idx) => {
          return (
            <NavLink to={to} className="nav-link" key={idx}>{name}</NavLink>
          );
        })}

      </Nav>
      <Nav>
        {currentUser ? <>
          <NavLink to="/me" className="nav-link">
            Logged in as {currentUser.username}
          </NavLink>
          <Nav.Link className="nav-link" onClick={handleLogout}>
            Log Out
          </Nav.Link>
        </> : <>
          <NavLink to="/login" className="nav-link">
            Log In
          </NavLink>
          <NavLink to="/register" className="nav-link">
            Sign Up
          </NavLink>
        </>}
      </Nav>
    </Navbar>
  );
};

export default withRouter(CustomNavbar);