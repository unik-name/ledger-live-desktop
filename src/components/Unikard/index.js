import React, { PureComponent } from 'react'
import { compose } from 'redux'
import { connect } from 'react-redux'
import { translate } from 'react-i18next'
import { createStructuredSelector } from 'reselect'

import Box from 'components/base/Box'

import './main.css'

type Props = {

}

type State = {

}

const mapStateToProps = createStructuredSelector({
    // TODO map state
  })
  
  const mapDispatchToProps = {
    // TODO map dispatch
  }


class Unikard extends PureComponent<Props, State> {
    
    render(){
        let { unikname } = this.props;
        
        let label = unikname.resolver.label;
        let coinSupportedLabel = label === 'default' ? '' : `by #${label}`;

        let supportedCoins = unikname.supportedTypes.map((type)=>(
            <span className="type">
                <img src={type.image}/>
                <span>{type.type}</span>
            </span>
        ))


        let stars = [];
        for( let i = 0; i < 5;i++){
            stars.push( i < unikname.security.trust ? (<span>★</span>) : (<span>☆</span>))
        }

        return (
            <Box flow={1} className="unikard">
                <Box horizontal className="header">
                    <span className="profile_picture" src={unikname.type}>
                        <img src={unikname.profile.picture}/>
                    </span>
                    <h1>@{unikname.resolver.unikname}</h1>
                </Box>
                <Box vertical className="body">
                    <Box horizontal flow={2} className="security">
                        <div className="trust">
                            <span>Trust:</span>
                            <span className="stars">{stars}</span>
                        </div>
                    </Box>
                    <Box vertical flow={2} className="types">
                        <h2>Types supported {coinSupportedLabel}</h2>
                        <div> 
                            {supportedCoins}
                        </div>
                    </Box>
                </Box>
                <Box className="footer">
                    <a>unik-name.com</a>  
                </Box>
            </Box>
        );
    }


}

export default compose(
    connect(
      mapStateToProps,
      mapDispatchToProps,
    ),
    translate(),
  )(Unikard)
  