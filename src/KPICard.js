import React from 'react';
import { Container } from './styled-components';

class KPICard extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {
        return <Container className="col-lg-3 col-sm-6 is-light-text mb-4">
            <Container className="card grid-card is-card-dark">
                <Container className="card-heading">
                    <Container className="is-dark-text-light letter-spacing text-small">
                        {this.props.indicator}
                    </Container>
                </Container>

                <Container className="card-value pt-4 text-x-large">
                    <span className="text-large pr-1"></span>
                    {this.props.value}
                </Container>
            </Container>
        </Container>
    }
}

export default KPICard;