import React, { PureComponent } from 'react'
import { compose } from 'redux'
import { connect } from 'react-redux'
import { translate } from 'react-i18next'
import { createStructuredSelector } from 'reselect'

import Box from 'components/base/Box'


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

const style={

    card:{

    },


    profile_picture:{
        'borderRadius': '50%',
        'height': '45px',
        'width': '45px',
        'marginRight': '1rem'
    }

}


class Unikard extends PureComponent<Props, State> {
    
    render(){
        let { unikname } = this.props;
        
        let label = unikname.resolver.label;
        let coinSupportedLabel = label === 'default' ? '' : `by #${label}`;

        let supportedCoins = unikname.supportedTypes.map((type)=>`${type.type}`).join(' - ')

        return (
            <Box flow={1} style={style.card}>
                <Box horizontal>
                <span>
                    <img style={style.profile_picture} src={unikname.profile.picture}/>
                </span>
                    <h1>@{unikname.resolver.unikname}</h1>
                </Box>
                <Box horizontal flow={2}>
                    <h2>Trust:</h2>{unikname.security.trust}/5
                    <h2>Unik:</h2>{unikname.security.unik ? "true" : "false"}
                </Box>
                <Box>
                    <h2>Coin supported {coinSupportedLabel}</h2>
                    {supportedCoins}
                </Box>
                <span>unik-name.com</span>  
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
  