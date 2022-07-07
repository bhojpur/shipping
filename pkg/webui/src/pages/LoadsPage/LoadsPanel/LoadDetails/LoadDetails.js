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
import {Button} from 'react-bootstrap';
import {get} from 'lodash';

const LoadDetails = ({
  load = {},
  setIsEditMode,
  onLoadDelete,
}) => {
  const dimensions = get(load, 'dimensions', '');
  const handleLoadDelete = async () => {
    await onLoadDelete(load._id);
  };

  return (
    <div>
      <div>
        <h4>Load details</h4>
        <div>Name: {load.name}</div>
        <div>Payload: {load.payload}</div>
        <div>
            Dimensions:
          <div>Width: {dimensions.width}</div>
          <div>Height: {dimensions.height}</div>
          <div>Length: {dimensions.length}</div>
        </div>
      </div>
      <div className="mt-3">
        <Button
          variant="primary"
          className="mr-3"
          onClick={() => setIsEditMode(true)}
        >
            Edit
        </Button>
        <Button
          variant="danger"
          onClick={handleLoadDelete}
          className="mr-3"
        >
              Delete
        </Button>
      </div>
    </div>
  );
};

export default LoadDetails;