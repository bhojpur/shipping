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
import {Formik} from 'formik';
import {Alert, Button, Col, Container, Form, Row} from 'react-bootstrap';
import * as yup from 'yup';
import {postChangePassword} from '../../api/userApi';
import authService from '../../service/AuthService';
import {withRouter} from 'react-router-dom';
import {
  PASSWORD_CHANGED,
} from '../../constants/messages';

const schema = yup.object({
  currentPassword: yup.string().required('Current password is required'),
  newPassword: yup.string().required('New password is required'),
  passwordConfirmation: yup.string()
      .oneOf([yup.ref('newPassword'), null], 'Passwords must match'),
});

const ChangePassword = ({currentUser, history}) => {
  const handleSubmit = (formValues, {setStatus}) => {
    const passwordData = {
      oldPassword: formValues.currentPassword,
      newPassword: formValues.newPassword,
    };

    postChangePassword(currentUser._id, passwordData)
        .then(() => {
          authService.logOut();
          history.push({
            pathname: '/',
            state: {
              message: PASSWORD_CHANGED,
            },
          });
        })
        .catch((err) => {
          setStatus({password: err.response.data.error});
        });

    setStatus(null);
  };

  return (
    <Formik
      validationSchema={schema}
      onSubmit={handleSubmit}
      initialValues={{
        currentPassword: '',
        newPassword: '',
        passwordConfirmation: '',
      }}
    >{({
        handleSubmit,
        handleChange,
        values,
        errors,
        status,
      }) => (
        <Container>
          <Row>
            <Col md={{span: 6, offset: 3}}>
              <Form>
                {!!status && <Alert variant="danger">
                  {status.password}
                </Alert>}
                <Form.Group controlId="formCurrentPassword">
                  <Form.Label>Current Password</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Enter current password"
                    value={values.currentPassword}
                    name="currentPassword"
                    onChange={handleChange}
                    isInvalid={!!errors.currentPassword}
                  />

                  <Form.Control.Feedback type="invalid">
                    {errors.currentPassword}
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group controlId="formNewPassword">
                  <Form.Label>New password</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Enter new password"
                    value={values.newPassword}
                    name="newPassword"
                    onChange={handleChange}
                    isInvalid={!!errors.newPassword}
                  />

                  <Form.Control.Feedback type="invalid">
                    {errors.newPassword}
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group controlId="formConfirmPassword">
                  <Form.Label>Confirm password</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Confirm your new password"
                    value={values.passwordConfirmation}
                    name="passwordConfirmation"
                    onChange={handleChange}
                    isInvalid={!!errors.passwordConfirmation}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.passwordConfirmation}
                  </Form.Control.Feedback>
                </Form.Group>

                <Button
                  variant="primary"
                  type="button"
                  onClick={handleSubmit}
                >
                    Submit
                </Button>
              </Form>
            </Col>
          </Row>
        </Container>
      )
      }
    </Formik>
  );
};

export default withRouter(ChangePassword);