import React, { useEffect } from "react";
import { useState } from "react";
import { connect } from 'react-redux';
import HeaderV2 from "../partial/headerV2";
import SideBarV2 from "../partial/sideBarV2";
import TutorialPopup, { TutorialVideoPopup } from "../tutorialPopup";
import ChannelPartnerTab from "./ChannelPartnerTab";
import ExportersTab from "./ExportersTab";
import FinancersTab from "./FinancersTab";
import ImportersTab from "./ImportersTab";
import UserFeatureTab from "./UserFeatureTab";

const tutorialPopupCSS = {
  "0": {
    popup: {
      "top": "18rem",
      "right": "6rem"
    },
    arrow: {
      "top": "28rem",
      "zIndex": 10,
      transform: "rotate(110deg)",
      left: "15.5%"
    },
    children: <label className='font-size-14 font-wt-600 text-color-value'><span>You can check your "Payment, Finance & Shipment report" by clicking on the respective tab under Reports.</span></label>
  }
}

const UserOnboard = ({ userTokenDetails, navToggleState }) => {
  const queryParams = new URLSearchParams(window.location.search)
  let hideTopBarr = queryParams.get('hideTopBar')

  const [tab, setTab] = useState(queryParams.get("tab"));
  const [lcTutorial, toggleLCTutorial] = useState(localStorage.getItem("lcTutorialStep") == 3)
  const [tutorialStage, setTutorialStage] = useState(0)
  const [showTutorialVideo, toggleTutorialVideo] = useState({ show: false, link: null })
  const [hideTopBar, setHideTopBar] = useState(hideTopBarr || false)

  const userId = userTokenDetails.user_id ? userTokenDetails.user_id : null


  useEffect(() => {
    console.log("tab name ", tab)
  }, [tab])

  return (
    <>

      <TutorialPopup show={lcTutorial} featureName={"Reports"} positioning={{
        ...tutorialPopupCSS[tutorialStage]["popup"]
      }} showSkip={true} userId={userId} showNext={true}
        onNext={() => {
          localStorage.setItem('lcTutorialStep', 4)
          window.location.reload()
        }}
        onBack={() => {
          localStorage.setItem("lcTutorialStep", 2)
          window.location.reload()
        }}
        showBack={false} videoLinkLabel={"Watch detailed video about Reports"}
        onVideoLinkClick={() => toggleTutorialVideo({ show: true, link: "https://www.youtube.com/embed/tgbNymZ7vqY" })}
        children={tutorialPopupCSS[tutorialStage]["children"]}
        arrowPositioning={{
          ...tutorialPopupCSS[tutorialStage]["arrow"]
        }} />

      <TutorialVideoPopup
        show={showTutorialVideo.show}
        videoLink={showTutorialVideo.link}
        onClose={() => toggleTutorialVideo({ show: false, link: null })}
      />

      <div className="container-fluid">
        <div className="row">
          <SideBarV2 state={"UserOnboard"} userTokenDetails={userTokenDetails} />
          <main role="main" className={"ml-sm-auto col-lg-10 " + (navToggleState.status ? " expanded-right" : "")} id="app-main-div">
            <HeaderV2
              title={"User Management"}
              userTokenDetails={userTokenDetails} />
            {!hideTopBar &&
              <nav>
                <div className="nav nav-tabs signdoctabs gap-4 border-0" id="signdoctabs" role="tablist">
                  <button className={`nav-link  bg-transparent ${tab === "Exporter" && 'active'} paymenttab`} id="nav-home-tab" data-bs-toggle="tab" type="button" role="tab" aria-controls="nav-home" aria-selected="true"
                    onClick={() => {
                      window.location = '/usersonboard?tab=Exporter'
                      // setTab("Exporter")
                    }}>Exporter/Importer</button>
                  <span className="border-left"></span>
                  {/* <button className={`nav-link  bg-transparent ${tab === "Importer" && 'active'} paymenttab`} id="nav-profile-tab" data-bs-toggle="tab" type="button" role="tab" aria-controls="nav-profile" aria-selected="false" onClick={() => setTab("Importer")}>Importer</button>
                <span className="border-left"></span> */}
                  <button className={`nav-link  bg-transparent ${tab === "Financers" && 'active'} paymenttab`} id="nav-contact-tab " data-bs-toggle="tab" type="button" role="tab" aria-controls="nav-contact" aria-selected="false"
                    onClick={() => {
                      window.location = '/usersonboard?tab=Financers'
                      // setTab("Financers")
                    }}>Financers</button>
                  <span className="border-left"></span>
                  <button className={`nav-link  bg-transparent ${tab === "Channel Partner" && 'active'} paymenttab`} id="nav-contact-tab " data-bs-toggle="tab" type="button" role="tab" aria-controls="nav-contact" aria-selected="false"
                    onClick={() => {
                      window.location = '/usersonboard?tab=Channel Partner'
                      // setTab("Channel Partner")
                    }}>Channel Partner</button>

                </div>
              </nav>
            }
            <div className="tab-content d-block" id="nav-tabContent" style={lcTutorial ? { position: 'relative', zIndex: -1 } : {}}>
              {tab === "Exporter" && <div className="tab-pane fade show active bg-transparent " id="nav-home" role="tabpanel" >
                <ExportersTab userTokenDetails={userTokenDetails} setHideTopBar={setHideTopBar} />
              </div>
              }
              {/* {tab === "Importer" && <div className="tab-pane fade show active bg-transparent " id="nav-home" role="tabpanel" >
                <ImportersTab userTokenDetails={userTokenDetails} />
              </div>
              } */}
              {tab === "Financers" && <div className="tab-pane fade show active bg-transparent " id="nav-home" role="tabpanel" >
                <FinancersTab userTokenDetails={userTokenDetails} setHideTopBar={setHideTopBar} />
              </div>
              }
              {tab === "Channel Partner" && <div className="tab-pane fade show active bg-transparent " id="nav-home" role="tabpanel" >
                <ChannelPartnerTab userTokenDetails={userTokenDetails} setHideTopBar={setHideTopBar} />
              </div>
              }

            </div>
          </main>
        </div>
      </div >
    </>
  );
}
const mapStateToProps = state => {

  return {
    navToggleState: state.navToggleState,
    // channelPartnerAccountList: state.channelPartnerAccountList,
    // channelPartnerDisbursedInvoice: state.channelPartnerDisbursedInvoice,
    // channelPartnerRaisedInvoice: state.channelPartnerRaisedInvoice
  }
}

export default connect(
  mapStateToProps,
  null
)(UserOnboard)