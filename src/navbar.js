import React from 'react';
import { Nav } from './styled-components';


class Navbar extends React.Component {
    render() {
        return <Nav className="navbar navbar-expand-lg fixed-top is-white is-dark-text" >
            <div className="navbar-brand h1 mb-0 text-large font-medium">
                Analytics Dashboard
      </div>
            <div className="navbar-nav ml-auto">
                <div className="user-detail-section">
                    <span className="pr-2">Hi, #developer</span>
                    <span className="img-container">
                    </span>
                </div>
            </div>
        </Nav >
    }
}

export default Navbar;