// @flow
import React, { Component } from 'react'
import type { Account } from '@ledgerhq/live-common/lib/types'
import type { T } from 'types/common'
import type { WalletBridge } from 'bridge/types'
import { openURL } from 'helpers/linking'
import { urls } from 'config/urls'
import Box from 'components/base/Box'
import LabelWithExternalIcon from 'components/base/LabelWithExternalIcon'
import Label from 'components/base/Label'
import RecipientAddress from 'components/RecipientAddress'
import Unikard from 'components/Unikard'

import { track } from 'analytics/segment'
import { createCustomErrorClass } from 'helpers/errors'
import { CantScanQRCode } from 'config/errors'

import network from 'api/network'



type Props<Transaction> = {
  t: T,
  account: Account,
  bridge: WalletBridge<Transaction>,
  transaction: Transaction,
  onChangeTransaction: Transaction => void,
  autoFocus?: boolean,
}

const InvalidAddress = createCustomErrorClass('InvalidAddress')

class RecipientField<Transaction> extends Component<
  Props<Transaction>,
  { isValid: boolean, warning: ?Error, QRCodeRefusedReason: ?Error },
> {
  state = {
    isValid: true,
    warning: null,
    QRCodeRefusedReason: null,
    unikname:null,
    resolverErrorMsg:null
  }
  componentDidMount() {
    this.resync()
  }
  componentDidUpdate(nextProps: Props<Transaction>) {
    if (
      nextProps.account !== this.props.account ||
      nextProps.transaction !== this.props.transaction
    ) {
      this.resync()
    }
  }
  componentWillUnmount() {
    this.syncId++
    this.isUnmounted = true
  }
  isUnmounted = false
  syncId = 0
  async resync() {
    const { account, bridge, transaction } = this.props
    const syncId = ++this.syncId
    const recipient = bridge.getTransactionRecipient(account, transaction)
    const isValid = await bridge.isRecipientValid(account.currency, recipient)
    const warning = await bridge.getRecipientWarning(account.currency, recipient)
    if (syncId !== this.syncId) return
    if (this.isUnmounted) return
    this.setState({ isValid, warning })
  }

  onChange = async (recipient: string, maybeExtra: ?Object) => {
    const { bridge, account, transaction, onChangeTransaction } = this.props
    const { QRCodeRefusedReason } = this.state
    const { amount, currency, fromQRCode } = maybeExtra || {}
    if (currency && currency.scheme !== account.currency.scheme) return false
    let t = transaction
    if (amount) {
      t = bridge.editTransactionAmount(account, t, amount)
    }
    const warning = fromQRCode
      ? await bridge.getRecipientWarning(account.currency, recipient)
      : null
    if (this.isUnmounted) return false
    if (warning) {
      // clear the input if field has warning AND has a warning
      t = bridge.editTransactionRecipient(account, t, '')
      this.setState({ QRCodeRefusedReason: new CantScanQRCode() })
    } else {
      t = bridge.editTransactionRecipient(account, t, recipient)
      if (QRCodeRefusedReason) this.setState({ QRCodeRefusedReason: null })
    }
    onChangeTransaction(t)
    return true
  }

  onBlur = async (event)=>{

    const { bridge,account,transaction, onChangeTransaction } = this.props

    let unikname = event.currentTarget.value;
    
    let recepient = unikname.split('#');

    let explicit = recepient[0].substr(1);
    let label = recepient[1] ? recepient[1] : "default";
    let type = account.currency.ticker ;


    let status,data;
    try{

      let prefixIndex = account.name ? account.name.indexOf('@') : -1;
      let headers = prefixIndex === 0 ? {'Authorization': `Basic ${account.name.substr(1).split('#')[0]}`} : undefined

      let result = await network({ method: 'GET', url: `http://localhost:3000/uniknames/${explicit}/labels/${label}/types/${type}` ,headers})

      status = result.status;
      data = result.data;

      console.log("code",status)
      console.log("data",data);

    }catch(error){
      console.error("network promise",error)
      status = error.status;
    }    


    switch (status){
      case 200:
        if (data) {
          this.setState({ resolverErrorMsg:null,unikname: data })
          let t = bridge.editTransactionRecipient(account, transaction, data.resolver.address)
          onChangeTransaction(t)
        } else{
          console.error("no data");
        }
        break;
      case 404:
        this.setState({ resolverErrorMsg: "@unik-name could't be resolved" })
      break;
      case 403:
        this.setState({ resolverErrorMsg: "You're not authorized by @unik-name's owner" })
      break;
      case 401:
        this.setState({ resolverErrorMsg: "You need a @unik-name to resolve" })
      break;
    }

  }

  handleRecipientAddressHelp = () => {
    openURL(urls.recipientAddressInfo)
    track('Send Flow Recipient Address Help Requested')
  }
  render() {
    const { bridge, account, transaction, autoFocus } = this.props
    const { isValid, warning, QRCodeRefusedReason,unikname, resolverErrorMsg } = this.state

    let recipient = bridge.getTransactionRecipient(account, transaction)
    if( unikname ){
      recipient = `@${unikname.resolver.unikname}`
      let label = unikname.resolver.label;
      if( label !== 'default' ){
        recipient += `#${label}`
      }
    }

    const value = recipient;

    const error =
      !value || isValid
        ? QRCodeRefusedReason
        : new InvalidAddress(null, { currencyName: account.currency.name })


    let resolverError = resolverErrorMsg ? (<span style={{color:'red'}} >{resolverErrorMsg}</span>) : null;

    let resolvedAddress = unikname ? <LabelWithExternalIcon label={`Resolved address : ${unikname.resolver.address}`}/> : null;
    let unikard = unikname ? <Unikard unikname={unikname}/> : null

    return (
        <Box flow={1}>
          <LabelWithExternalIcon
            onClick={this.handleRecipientAddressHelp}
            label="Recipient @unik-name"
          />
          <RecipientAddress
            autoFocus={autoFocus}
            withQrCode
            //error={error}
            //warning={warning}
            value={value}
            onChange={this.onChange}
            onBlur={this.onBlur}
          />
          {resolverError}
          {resolvedAddress}
          {unikard}
        </Box>
    )
  }
}

export default RecipientField
