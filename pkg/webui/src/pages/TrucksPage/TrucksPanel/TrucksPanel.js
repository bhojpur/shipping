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

import React, {useEffect, useState} from 'react';
import TruckList from './TruckList/TruckList';
import {Col, Row} from 'react-bootstrap';
import TruckDetails from './TruckDetails/TruckDetails';
import EditTruckForm from './EditTruckForm/EditTruckForm';
import {
  deleteTruck,
  getTrucks,
  postAssignTruck, postCreateTruck,
  putTruck,
} from '../../../api/trucksApi';

const TrucksPanel = ({currentUser}) => {
  const [trucks, setTrucks] = useState([]);
  const [selectedTruckIdx, setSelectedTruckIdx] = useState(0);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isTrucksLoaded, setIsTrucksLoaded] = useState(false);

  const fetchTrucks = async () => {
    const {trucks} = await getTrucks();
    setTrucks(trucks);

    if (trucks.length === 0) {
      setIsEditMode(true);
    }
  };

  useEffect(() => {
    fetchTrucks().then(() => {
      setIsTrucksLoaded(true);
      setSelectedTruckIdx(0);
    });
  }, []);

  const updateTrucks = async (truckId, editedTruckData) => {
    await putTruck(truckId, editedTruckData);
    await fetchTrucks();
  };

  const assignTruck = async (truckId) => {
    await postAssignTruck(currentUser._id, truckId);
    await fetchTrucks();
  };

  const removeTruck = async (truckId) => {
    await deleteTruck(truckId);
    await fetchTrucks();
  };

  const createTruck = async (truckData) => {
    await postCreateTruck(truckData);
    await fetchTrucks();
    const lastTruckIdx = trucks.length || 1;
    setSelectedTruckIdx(lastTruckIdx - 1);
  };

  const handleTruckSelect = (truckIdx) => {
    setSelectedTruckIdx(truckIdx);
    if (truckIdx !== -1) {
      setIsEditMode(false);
    }
  };

  const selectedTruck = trucks[selectedTruckIdx];
  const hasUserTrucks = trucks.length !== 0;


  return (
    <>
      <Row>
        <Col>
          {hasUserTrucks ? <h4>Here are your trucks: </h4> :
              <h4>Looks like you don`t have any trucks yet.
                You can add it below</h4>}
        </Col>
      </Row>
      {isTrucksLoaded && <Row>
        <Col md={4}>
          <TruckList
            trucks={trucks}
            onTruckSelect={handleTruckSelect}
            selectedTruckIdx={selectedTruckIdx}
            onSetIsEditMode={setIsEditMode}
          />

        </Col>
        <Col md={8}>
          {(isEditMode ?
              <EditTruckForm
                truck={selectedTruck}
                setIsEditMode={setIsEditMode}
                onUpdateTrucks={updateTrucks}
                onCreateTruck={createTruck}
              /> :
              <TruckDetails
                truck={selectedTruck}
                setIsEditMode={setIsEditMode}
                onTruckAssign={assignTruck}
                onTruckDelete={removeTruck}
              />)
          }
        </Col>
      </Row>}
    </>
  );
};

export default TrucksPanel;