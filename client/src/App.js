import React from 'react';
import './App.css';
import Joi from 'joi';
import L from 'leaflet';
import { Map, TileLayer, Marker, Popup } from 'react-leaflet';
import { Card, Button, CardTitle, CardText } from 'reactstrap';
import { Form, FormGroup, Label, Input } from 'reactstrap';
import current_user_location from './current_user_location.svg';
import other_user_location from './other_user_location.svg';

const myIcon = L.icon({
  iconUrl: current_user_location,
  iconSize: [25, 41],
  iconAnchor: [11, 47],
  popupAnchor: [0, -47],
});

const othersIcon = L.icon({
  iconUrl: other_user_location,
  iconSize: [25, 41],
  iconAnchor: [25, 82],
  popupAnchor: [25, -82]
})

const schema = Joi.object().keys({
  name: Joi.string().min(1).max(100).required(),
  message: Joi.string().min(1).max(500).required()
});

const API_URL = window.location.hostname === 'localhost' ? 'http://localhost:5000/api/v1/messages' : 'production-url';

class App extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      lat: 51.505,
      lng: -0.09,
      zoom: 0,
      hasUserLocation: null,
      userInfo: {
        name: '',
        message: ''
      },
      sendingMsg: false,
      sentMsg: false,
      messages: []
    }
  }

  componentDidMount() {
    // get all messages
    fetch(API_URL)
    .then(res => res.json())
    .then(messages => {
      const haveThisLocation = {};
      messages = messages.reduce(function(all, currentMsg) {
        const key = `${currentMsg.latitude}${currentMsg.longitude}`;
        if (haveThisLocation[key]) {
          haveThisLocation[key].otherMsgs = haveThisLocation[key].otherMsgs || [];
          haveThisLocation[key].otherMsgs.push(currentMsg);
        } else {
          haveThisLocation[key] = currentMsg;
          all.push(currentMsg);
        }

        return all;
      }, []);

      this.setState({
        messages
      })
    });

    // get the current user locaiton
    let self = this;
    navigator.geolocation.getCurrentPosition(function(position) {
      self.setState({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          zoom: 1
      }, () => {
        setTimeout(() => {
          self.setState({
            hasUserLocation: true,
            zoom: 13
          })
        }, 3000);
      });
    }, () => {
      console.log('uh oh.. they did not give us their location')
      fetch('https://ipapi.co/json')
      .then(res => res.json())
      .then(location => {
        self.setState({
          lat: location.latitude,
          lng: location.longitude,
          zoom: 2
        }, () => {
          setTimeout(() => {
            self.setState({
              hasUserLocation: true,
              zoom: 13
            })
          }, 3000);
        })
      })
    });
  }

  onFormChange(e) {
    const {name, value} = e.target;
    
    this.setState((prevState) => ({
      userInfo: {
        ...prevState.userInfo,
        [name]: value
      }
    }))
  }

  onFormSubmit(e) {
    e.preventDefault();
    //console.log(this.state.userInfo)

    this.setState({
      sendingMsg: true,
      sentMsg: true
    })

    const userMessage = {
      name: this.state.userInfo.name,
      message: this.state.userInfo.message
    };

    const result = Joi.validate(userMessage, schema);

    if (!result.error) {
      fetch(API_URL, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          ...userMessage,
          latitude: this.state.lat,
          longitude: this.state.lng
        })
      })
      .then(res => res.json())
      .then(msg => {
        setTimeout(() => {
          this.setState({
            sendingMsg: false
          })
        }, 4000);
        console.log(msg)
      });
    }
  }

  render() {

    const position = [this.state.lat, this.state.lng];

    return (
      <div id="root">
        <Map className="map" center={position} zoom={this.state.zoom}>
          <TileLayer
            attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {
            this.state.hasUserLocation ?
            <Marker 
              position={position}
              icon={myIcon}>
            </Marker> : ''
          }
          {
            this.state.messages.map((message, index) => (
              <Marker 
                position={[message.latitude, message.longitude]}
                icon={othersIcon}
                key={index}>
                <Popup>
                  <p><em>{message.name}:</em> {message.message}</p>
                  { message.otherMsgs ? message.otherMsgs.map((msg, index) => (<p key={index}><em>{msg.name}:</em> {msg.message}</p>)) : '' }
                </Popup>
              </Marker>
            ))
          }
        </Map>
        <Card className="card" body inverse style={{ backgroundColor: '#333', borderColor: '#333' }}>
          <CardTitle>Welcome to Cosmopolitan!</CardTitle>
          <CardText>Leave a message with your location!</CardText>
          <CardText>Thanks for stopping by!</CardText>
          {
            !this.state.sentMsg && this.state.hasUserLocation ?
            <Form>
              <FormGroup>
                <Label for="name">Name:</Label>
                <Input 
                  type="text" 
                  name="name" 
                  id="name" 
                  placeholder="Enter your name please:" 
                  onChange={(e) => this.onFormChange(e)}
                />
              </FormGroup>
              <FormGroup>
                <Label for="message">Message:</Label>
                <Input 
                  type="textarea" 
                  name="message" 
                  id="message" 
                  placeholder="Enter your message please:" 
                  onChange={(e) => this.onFormChange(e)}
                />
              </FormGroup>
              <Button 
                onClick={(e) => this.onFormSubmit(e)} 
                type="submit" color="info" 
                disabled={!this.state.hasUserLocation || !this.state.userInfo.name || !this.state.userInfo.message}
              >
                Send
              </Button>
            </Form> :
            this.state.sendingMsg || !this.state.hasUserLocation ? 
            <video autoPlay loop src="https://media.giphy.com/media/xkC0zz2GObJfy/giphy.mp4" alt="loading..." /> : <CardText>Thanks for submitting a message!</CardText>
          }
        </Card>
      </div>
    );
  }
}

export default App;