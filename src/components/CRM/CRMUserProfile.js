import React from 'react'
import { connect } from 'react-redux'
import SideBarV2 from '../partial/sideBarV2'
import HeaderV2 from '../partial/headerV2'
import UserDetails from '../UserOnboard/UserDetails'
import CRMUserDetails from './CRMUserDetails'

const CRMUserProfile = ({ navToggleState, userTokenDetails }) => {
  const showExporterDetails = JSON.parse(localStorage.getItem("exporterDetails"))
  console.log(showExporterDetails,'detailsssss')
  return (
    <div className={"container-fluid"}>
      <div className="row">

        <SideBarV2 state={"masterdata"} userTokenDetails={userTokenDetails} />
        <main role="main" className={`ml-sm-auto col-lg-10 ` + (navToggleState.status ? " expanded-right" : "")} id="app-main-div">
          <HeaderV2
            title={"Master Data"}
            userTokenDetails={userTokenDetails} />
          {(showExporterDetails.isVisible && !showExporterDetails.isOnboarded) &&
            <CRMUserDetails data={showExporterDetails.data} goBack={() => {
              window.history.back()
            }} userTokenDetails={userTokenDetails} />
          }
          {(showExporterDetails.isVisible && showExporterDetails.isOnboarded) &&
            <div className='mt-4'>
              <UserDetails data={showExporterDetails.data} goBack={() => {
                window.history.back()
              }} userTokenDetails={userTokenDetails} />
            </div>
  
          }
        </main>
      </div>
    </div>
  )
}
const mapStateToProps = state => {

  return {
    navToggleState: state.navToggleState,
    // channelPartnerAccountList: state.channelPartnerAccountList,
    // channelPartnerDisbursedInvoice: state.channelPartnerDisbursedInvoice,
    // channelPartnerRaisedInvoice: state.channelPartnerRaisedInvoice
  }
}
export default connect(mapStateToProps, null)(CRMUserProfile)