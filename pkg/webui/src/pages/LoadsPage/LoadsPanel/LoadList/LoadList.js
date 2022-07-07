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
import LoadItem from '../LoadItem/LoadItem';
import {ListGroup} from 'react-bootstrap';

const LoadList = ({
  loads,
  onLoadSelect,
  selectedLoadIdx,
  onSetIsEditMode,
}) => {
  return (
    <ListGroup>
      {loads.map((load, idx) => {
        return (
          <LoadItem
            key={load._id}
            load={load}
            idx={idx}
            onLoadSelect={onLoadSelect}
            active={selectedLoadIdx === idx}
          />
        );
      })}
      <ListGroup.Item
        action
        active={selectedLoadIdx === -1}
        onClick={() => {
          onSetIsEditMode(true);
          onLoadSelect(-1);
        }}
        variant="success"
        eventKey={-1}
      >
        <div className="d-flex justify-content-between align-items-center">
          <div>
            + Create load
          </div>
        </div>
      </ListGroup.Item>
    </ListGroup>
  );
};

export default LoadList;