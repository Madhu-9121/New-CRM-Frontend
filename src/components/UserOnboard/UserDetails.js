import React, { useEffect } from 'react'
import { useState } from 'react';
import ReactCountryFlag from 'react-country-flag';
import BuyersTab from './BuyersTab';
import UserDetailsTab from './UserDetailsTab';
import UserProfileTab from './UserProfileTab';
import Payment from "../Reports/components/payment";
import ShipmentTab from "../Reports/components/shipmentTab";
import TransactionsTab from './TransactionsTab';
import call from '../../service';
import toastDisplay from '../../utils/toastNotification';
import moment from 'moment';
import ApplicationTab from './ApplicationTab';

import { connect } from 'react-redux';
import ExporterManagement from '../myCounterPartComp/exporterManagement';
const userTabs = [
  "User details",
  "Profile",
  "Buyers",
  "Shipment",
  "Payments",
  "Transactions"
]

const UserDetails = ({ data, goBack, userTokenDetails, navToggleState }) => {
  const queryParams = new URLSearchParams(window.location.search)

  const [tab, setTab] = useState(queryParams.get("detailTab") || 'User details')
  const [salesPerson, setSalesPerson] = useState([])
  const [editPopup, setEditPopup] = useState(false)
  const userPermissionsForSubAdmin = JSON.parse(userTokenDetails.UserAccessPermission || "{}")
  const [businessUserToken, setBusinessUserToken] = useState({})
  // console.log('userTokenDetails111111111111111', userTokenDetails, data);

  useEffect(() => {
    getBusinessUserToken()
  }, [])

  async function getBusinessUserToken() {
    let tempBusinessUserToken = await call('post', 'loginV2', { username: data.email_id, password: data.password, bypassAccountNotActiveError: true })
    setBusinessUserToken(tempBusinessUserToken)
  }

  useEffect(() => {
    if (userPermissionsForSubAdmin.mainAdmin || userPermissionsForSubAdmin?.["Assign Task"]) {
      call("POST", 'getSubAdminUser', {}).then(res => {
        setSalesPerson(res.data)
      }).catch(err => { })
    }
  }, [])
  const updateLeadAssignedTo = (leadAssignedName, userId) => {
    call('POST', 'updateLeadAssignedTo', { leadAssignedName, userId }).then(result => {
      toastDisplay("Lead updated", "success")
      setTimeout(() => {
        window.location.reload()
      }, 500);
    }).catch(e => {
      toastDisplay("Failed to assign lead to " + leadAssignedName, "error")
    })
  }
  return (
    <>

      <div className="col">
        <div className='d-flex flex-row justify-content-between'>
          <div className="d-flex flex-row align-items-center gap-4">
            <div className="d-flex flex-row align-items-center">
              <img src="assets/images/ArrowBackLeft.png" height={20} width={20} className="cursor mx-2" onClick={goBack} />
              <div className="mx-2">
                <p className="font-wt-600 font-size-16 p-0 m-0">{data.company_name}</p>
                <label className="font-wt-500 font-size-14 text-color1 p-0 m-0">{data.email_id || 'NA'}</label>
              </div>
            </div>

            <div>
              <div className="d-flex flex-row align-items-center">
                <ReactCountryFlag
                  countryCode={data.country_code}
                  style={{ width: '50px', height: '50px', "borderRadius": "15px" }} svg />
                <img src="assets/images/bytesize_edit.png" height={20} width={20} onClick={() => setEditPopup(true)} className="cursor mx-2" />
              </div>
            </div>
            {!data.subUserProfileDetails ? (
              <div className='d-flex flex-row align-items-center border-left pl-4'>
                <label className='font-size-13 mb-0 font-wt-600 mr-1'>{"Task Assigned To:  "}</label>
                <label class="font-wt-500 font-size-13 cursor mb-0 text-color1" id="dropdownMenuButton1" data-bs-toggle="dropdown" aria-expanded="false">
                  {data.TaskAssignedToName || '-'}
                  <img src='assets/images/arrow.png' />
                </label>
                <ul class="dropdown-menu" aria-labelledby="dropdownMenuButton1">
                  {salesPerson.map(element => {
                    return <li className="dropdown-item cursor font-wt-500 " onClick={() => updateLeadAssignedTo(element.id, data.id)} >{element.contact_person}</li>
                  })}
                </ul>
              </div>
            ) : null}
          </div>
          <div className="d-flex flex-row align-items-center">
            {data.last_login_at &&
              <label className='font-size-14 font-wt-600 mb-0'>{`Last login -  ${moment(data.last_login_at).format('DD/MM/YYYY hh:ss A ')}`}</label>
            }
          </div>
        </div>

      </div>
      <div className='mt-4'>
        <nav>
          <div className="nav nav-tabs signdoctabs gap-4 border-0" id="signdoctabs" role="tablist">
            <button className={`nav-link  bg-transparent ${tab === "User details" && 'active'} paymenttab`} id="nav-home-tab" data-bs-toggle="tab" type="button" role="tab" aria-controls="nav-home" aria-selected="true"
              onClick={() => {
                const params = new URLSearchParams(window.location.search);
                params.set('detailTab', 'User details');
                window.location = `${window.location.pathname}?${params.toString()}`;
              }}>User details</button>
            <button className={`nav-link  bg-transparent ${tab === "Profile" && 'active'} paymenttab`} id="nav-profile-tab" data-bs-toggle="tab" type="button" role="tab" aria-controls="nav-profile" aria-selected="false"
              onClick={() => {
                const params = new URLSearchParams(window.location.search);
                params.set('detailTab', 'Profile');
                window.location = `${window.location.pathname}?${params.toString()}`;
              }}>Profile</button>
            <button className={`nav-link  bg-transparent ${tab === "Applications" && 'active'} paymenttab`} id="nav-contact-tab " data-bs-toggle="tab" type="button" role="tab" aria-controls="nav-contact" aria-selected="false"
              onClick={() => {
                const params = new URLSearchParams(window.location.search);
                params.set('detailTab', 'Applications');
                window.location = `${window.location.pathname}?${params.toString()}`;
              }}>Applications</button>
            <button className={`nav-link  bg-transparent ${tab === "Suppliers" && 'active'} paymenttab`} id="nav-contact-tab " data-bs-toggle="tab" type="button" role="tab" aria-controls="nav-contact" aria-selected="false"
              onClick={() => {
                const params = new URLSearchParams(window.location.search);
                params.set('detailTab', 'Suppliers');
                window.location = `${window.location.pathname}?${params.toString()}`
              }}>Suppliers</button>
            <button className={`nav-link  bg-transparent ${tab === "Buyers" && 'active'} paymenttab`} id="nav-contact-tab " data-bs-toggle="tab" type="button" role="tab" aria-controls="nav-contact" aria-selected="false"
              onClick={() => {
                const params = new URLSearchParams(window.location.search);
                params.set('detailTab', 'Buyers');
                window.location = `${window.location.pathname}?${params.toString()}`
              }}>Buyers</button>
            <button className={`nav-link  bg-transparent ${tab === "Shipment" && 'active'} paymenttab`} id="nav-contact-tab " data-bs-toggle="tab" type="button" role="tab" aria-controls="nav-contact" aria-selected="false"
              onClick={() => {
                const params = new URLSearchParams(window.location.search);
                params.set('detailTab', 'Shipment');
                window.location = `${window.location.pathname}?${params.toString()}`
              }}>Shipment</button>
            <button className={`nav-link  bg-transparent ${tab === "Payments" && 'active'} paymenttab`} id="nav-contact-tab " data-bs-toggle="tab" type="button" role="tab" aria-controls="nav-contact" aria-selected="false"
              onClick={() => {
                const params = new URLSearchParams(window.location.search);
                params.set('detailTab', 'Payments');
                window.location = `${window.location.pathname}?${params.toString()}`
              }}>Payments</button>
            <button className={`nav-link  bg-transparent ${tab === "Transactions" && 'active'} paymenttab`} id="nav-contact-tab " data-bs-toggle="tab" type="button" role="tab" aria-controls="nav-contact" aria-selected="false"
              onClick={() => {
                const params = new URLSearchParams(window.location.search);
                params.set('detailTab', 'Transactions');
                window.location = `${window.location.pathname}?${params.toString()}`
              }}>Transactions</button>
          </div>
        </nav>
      </div>
      <div className="tab-content d-block" id="nav-tabContent" >
        {tab === "User details" && <div className="tab-pane fade show active bg-transparent " id="nav-home" role="tabpanel" >
          <UserDetailsTab userTokenDetails={data} editPopup={editPopup} setEditPopup={setEditPopup} />
        </div>
        }
        {tab === "Profile" && <div className="tab-pane fade show active bg-transparent " id="nav-home" role="tabpanel" >
          <UserProfileTab userTokenDetails={data} adminUserTokenDetails={userTokenDetails} />
        </div>
        }
        {tab === "Applications" && <div className="tab-pane fade show active bg-transparent " id="nav-home" role="tabpanel" >
          <ApplicationTab userTokenDetails={data} adminId={userTokenDetails.user_id} adminTypeId={userTokenDetails.type_id} />
        </div>
        }
        {tab === "Suppliers" && <div className="tab-pane fade show active bg-transparent " id="nav-home" role="tabpanel" >
          <div className="row my-4">
            <ExporterManagement userTokenDetails={businessUserToken} cpView={true} />
          </div>
        </div>
        }
        {tab === "Buyers" && <div className="tab-pane fade show active bg-transparent " id="nav-home" role="tabpanel" >
          <BuyersTab userTokenDetails={data} />
        </div>
        }
        {tab === "Shipment" && <div className="tab-pane fade show active bg-transparent " id="nav-home" role="tabpanel" >
          <ShipmentTab userTokenDetails={{
            ...data,
            user_id: data.id
          }} />
        </div>
        }
        {tab === "Payments" && <div className="tab-pane fade show active bg-transparent " id="nav-home" role="tabpanel" >
          <Payment userTokenDetails={{
            user_id: data.id,
            userName: data.company_name
          }} />
        </div>
        }
        {tab === "Transactions" && <div className="tab-pane fade show active bg-transparent " id="nav-home" role="tabpanel" >
          <TransactionsTab userTokenDetails={data} />
        </div>
        }
      </div>
    </>
  )
}
const mapStateToProps = state => {
  return {
    navToggleState: state,
  }
}
export default connect(mapStateToProps)(UserDetails)