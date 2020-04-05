import React from 'react';
import logo from './logo.svg';
import './App.css';

import * as FirestoreService from './services/firestore';
import { trackIP } from './services/apiLocator';

import { Container } from './styled-components';
import KPICard from './KPICard';

//FusionCharts
import FusionCharts from 'fusioncharts';
import Charts from "fusioncharts/fusioncharts.charts";
import ReactFC from 'react-fusioncharts';
import Maps from 'fusioncharts/fusioncharts.maps';
import World from "fusionmaps/maps/es/fusioncharts.world";
import './charts-theme';

ReactFC.fcRoot(FusionCharts, Charts, Maps, World);

class App extends React.Component {

  constructor(props) {
    super(props);
    this.state = { count: 0 };
  }

  /*
  metrics to calculate:
  - number of total requests (kpi) --> DONE
  - number of requests by day (line chart)
  - number of requests by country/location (map)
  - number of successful and unsuccessful requests by day (line chart)
  - number of requests(good + bad) today (kpi) --> DONE
  - number of different users/ip addresses (kpi)
  */

  // processes the requests data to return relevant objects
  // returns a response object with the data organized for 
  // plotting
  process(requests) {

    // number of requests per date
    const requestFrequencyByDate = {};
    // number of successful responses by date
    const goodRequestFrequencyByDate = {};
    // number of unsuccessful responses by date
    const badRequestFrequencyByDate = {};
    // list of distinct ip addresses
    const ipAddresses = {};
    let numRequestsToday = 0;
    let numBadRequestsToday = 0;
    let numGoodRequestsToday = 0;


    const todaysDate = new Date().toLocaleDateString('en-US');

    requests.forEach(
      request => {
        const date = new Date(request.date.seconds * 1000).toLocaleDateString('en-US');
        const status_code = request.status_code;
        const ip = request.ip;


        if (!(date in requestFrequencyByDate)) {
          requestFrequencyByDate[date] = 0;
        }
        requestFrequencyByDate[date]++;

        if (status_code == 200) {
          if (!(date in goodRequestFrequencyByDate)) {
            goodRequestFrequencyByDate[date] = 0;
          }
          goodRequestFrequencyByDate[date]++;
        }
        else {
          if (!(date in badRequestFrequencyByDate)) {
            badRequestFrequencyByDate[date] = 0;
          }
          badRequestFrequencyByDate[date]++;
        }

        if (!(ip in ipAddresses)) {
          ipAddresses[ip] = 1;
        }
        else {
          ipAddresses[ip]++;
        }

        if (date == todaysDate) {
          numRequestsToday++;

          if (status_code == 200) {
            numGoodRequestsToday++;
          }
          else {
            numBadRequestsToday++;
          }
        }
      }
    );

    let dates_categories = []
    const new_requestFrequencyByDate = [];
    const new_goodRequestFrequencyByDate = [];
    const new_badRequestFrequencyByDate = [];

    let keys = Object.keys(requestFrequencyByDate);
    keys = keys.sort((a, b) => (new Date(a)) - (new Date(b)));
    console.log(keys);

    for (let key in keys) {
      key = keys[key];
      dates_categories.push({
        label: key
      });

      new_requestFrequencyByDate.push({
        value: requestFrequencyByDate[key]
      });

      if (key in goodRequestFrequencyByDate) {
        new_goodRequestFrequencyByDate.push({
          value: goodRequestFrequencyByDate[key]
        });
      }
      else {
        new_goodRequestFrequencyByDate.push({
          value: 0
        });
      }

      if (key in badRequestFrequencyByDate) {
        new_badRequestFrequencyByDate.push({
          value: badRequestFrequencyByDate[key]
        });
      }
      else {
        new_badRequestFrequencyByDate.push({
          value: 0
        });
      }
    }

    return {
      requestFrequencyByDate: new_requestFrequencyByDate,
      dates_categories: dates_categories,
      badRequestFrequencyByDate: new_badRequestFrequencyByDate,
      goodRequestFrequencyByDate: new_goodRequestFrequencyByDate,
      numRequestsToday: numRequestsToday,
      numBadRequestsToday: numBadRequestsToday,
      numGoodRequestsToday: numGoodRequestsToday,
      numIpAddresses: Object.keys(ipAddresses).length,
      ipAddresses: ipAddresses,
      requestsByLocation: [],
      numCountries: 0
    }
  }

  componentDidMount() {
    // Fetch all data from the database (once per reload for now)
    // then process the data
    // and finally pass it down to the relevant components

    // request and process count async
    FirestoreService.getStatistics()
      .then(data => this.setState({ count: data.count }))
      .catch(err => this.setState({ count: -1 }));

    // request and process data async
    FirestoreService.getRequests()
      .then(requests => {

        const data = this.process(requests);

        this.setState((state, props) => {
          data.count = state.count;
          return data;
        });

        // extra processing for maps & location data
        const continents = [];
        const countries = [];
        for (const ip in data.ipAddresses) {

          trackIP(ip)
            .then(request => {
              const continent_code = request.continent_code;
              const country_code = request.country_code;

              if (!(continents.includes(continent_code))) {
                continents.push(continent_code);
                this.setState((state, props) => {
                  state.requestsByLocation.push({
                    id: continent_code,
                    value: data.ipAddresses[ip]
                  });
                  return state;
                });
              }
              else {
                this.setState((state, props) => {
                  for (const k in state.requestsByLocation) {
                    if (state.requestsByLocation[k].id == continent_code) {
                      state.requestsByLocation[k].value += data.ipAddresses[ip];
                    }
                  }
                  return state;
                });
              }

              if (!(countries.includes(country_code))) {
                countries.push(country_code);
                this.setState((state, props) => {
                  state.numCountries++;
                  return state;
                });
              }
            })
            .catch(err => console.log(err));

        }
      })
      .catch(err => -1);

  }

  render() {
    return <Container className="container-fluid pr-5 pl-5 pt-5 pb-5">
      <Container className="row">

        <KPICard indicator="Total requests" value={this.state.count} />

        <Container className="col-lg-3 col-sm-6 is-light-text mb-4">
          <Container className="card grid-card is-card-dark">
            <Container className="card-heading">
              <Container className="is-dark-text-light letter-spacing text-small">
                Requests today
                  </Container>
              <Container className="card-heading-brand">
                <i className="fab fa-amazon text-large" />
              </Container>
            </Container>

            <Container className="card-value pt-4 text-x-large">
              <span className="text-success">{this.state.numGoodRequestsToday}</span>
              +
              <span className="text-danger">{this.state.numBadRequestsToday}</span>
            </Container>
          </Container>
        </Container>

        <KPICard indicator="Total users (IPs)" value={this.state.numIpAddresses} />

        <KPICard indicator="Countries" value={this.state.numCountries} />

      </Container>

      <Container className="row" style={{ minHeight: "400px" }}>
        <Container className="col-md-6 mb-4">
          <Container className="card is-card-dark chart-card">
            <Container className="chart-container large full-height">
              <ReactFC
                {...{
                  type: "msline",
                  width: "100%",
                  height: "100%",
                  dataFormat: "json",
                  containerBackgroundOpacity: "0",
                  dataEmptyMessage: "Loading Data...",
                  dataSource: {
                    chart: {
                      theme: "classy-chart",
                      caption: "Requests",
                      subCaption: "By Day"
                    },
                    categories: [{
                      category: this.state.dates_categories
                    }],
                    dataset: [{
                      seriesName: "All Requests",
                      data: this.state.requestFrequencyByDate
                    },
                    {
                      seriesName: "Bad Requests",
                      data: this.state.badRequestFrequencyByDate
                    },
                    {
                      seriesName: "Good Requests",
                      data: this.state.goodRequestFrequencyByDate
                    }
                    ]
                  }
                }}
              />
            </Container>
          </Container>
        </Container>

        <Container className="col-md-6 mb-4">
          <Container className="card is-card-dark chart-card">
            <Container className="chart-container large full-height">
              <ReactFC
                {...{
                  type: "world",
                  width: "100%",
                  height: "100%",
                  dataFormat: "json",
                  containerBackgroundOpacity: "0",
                  dataEmptyMessage: "Loading Data...",
                  dataSource: {
                    chart: {
                      theme: "classy-chart",
                      caption: "Requests",
                      subCaption: "By Region"
                    },
                    colorrange: {
                      code: "#F64F4B",
                      minvalue: "0",
                      gradient: "1",
                      color: [
                        {
                          minValue: "10",
                          maxvalue: "25",
                          code: "#EDF8B1"
                        },
                        {
                          minvalue: "25",
                          maxvalue: "50",
                          code: "#18D380"
                        }
                      ]
                    },
                    data: this.state.requestsByLocation
                  }
                }}
              />
            </Container>
          </Container>
        </Container>

      </Container>

    </Container>
  }
}

export default App;
