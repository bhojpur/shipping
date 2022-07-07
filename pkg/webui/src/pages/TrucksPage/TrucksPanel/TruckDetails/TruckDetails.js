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

const TruckDetails = ({
  truck = {},
  setIsEditMode,
  onTruckAssign,
  onTruckDelete,
}) => {
  const dimensions = get(truck, 'dimensions', '');
  const isAssigned = !!truck.assignedTo;
  const handleTruckAssign = () => {
    onTruckAssign(truck._id);
  };
  const handleTruckDelete = async () => {
    await onTruckDelete(truck._id);
  };

  return (
    <div>
      <div>
        <h4>Truck details</h4>
        <div>Name: {truck.name}</div>
        <div>Max payload: {truck.maxPayload}</div>
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
          disabled={isAssigned}
        >
            Edit
        </Button>
        {!isAssigned && <>
          <Button
            variant="danger"
            onClick={handleTruckDelete}
            className="mr-3"
          >
              Delete
          </Button>
          <Button
            variant="success"
            onClick={handleTruckAssign}
          >
              Assign
          </Button>
        </>
        }
      </div>
    </div>
  );
};

export default TruckDetails;