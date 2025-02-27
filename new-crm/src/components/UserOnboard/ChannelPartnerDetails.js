import React, { useEffect } from 'react'
import { useState } from 'react';
import ReactCountryFlag from 'react-country-flag';
import BuyersTab from './BuyersTab';
import UserDetailsTab from './UserDetailsTab';
import UserProfileTab from './UserProfileTab';
import Payment from "../Reports/components/payment";
import ShipmentTab from "../Reports/components/shipmentTab";
import TransactionsTab from './TransactionsTab';
import CreditLineTab from '../viewProfile/components/CreditLineTab';
import toastDisplay from '../../utils/toastNotification';
import { ToastContainer } from 'react-toastify';
import SupplierList from '../myCounterPartComp/supplierList';
import FinPayment from '../Reports/components/FinPayments';
import CPDetailsTab from './CPDetailsTab';
import CPReferral from './CPReferral';
import call from '../../service';
import moment from 'moment';

const userTabs = [
  "User details",
  "Referral",
  "Payments",

]

const ChannelPartnerDetails = ({ data, goBack, userTokenDetails }) => {
  const [tab, setTab] = useState('User details')
  const [salesPerson, setSalesPerson] = useState([])
  console.log('chassdmamdnasjddsa', userTokenDetails);
  const userPermissionsForSubAdmin = JSON.parse(userTokenDetails.UserAccessPermission || "{}")

  useEffect(() => {
    if (userPermissionsForSubAdmin.mainAdmin || userPermissionsForSubAdmin?.["Assign Task"]) {
      call("POST", 'getSubAdminUser', {}).then(res => {
        setSalesPerson(res.data)
      }).catch(err => { })
    }
  }, [])
  const updateLeadAssignedTo = (leadAssignedName, userId) => {
    if (leadAssignedName && userId) {
      call('POST', 'updateLeadAssignedTo', { leadAssignedName, userId: data.id }).then(result => {
        toastDisplay("Lead updated", "success")
        setTimeout(() => {
          window.location.reload()
        }, 500);
      }).catch(e => {
        toastDisplay("Failed to assign lead to " + leadAssignedName, "error")
      })
    } else {

    }

  }
  console.log('dataaaaa', data);
  return (
    <>
      <ToastContainer position="bottom-right" autoClose={5000} hideProgressBar={false} newestOnTop closeOnClick rtl={false} pauseOnVisibilityChange draggable pauseOnHover />
      <div className="col">
        <div className='d-flex flex-row align-items-center justify-content-between'>
          <div className="d-flex flex-row align-items-center ">
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
                <img src="assets/images/bytesize_edit.png" height={20} width={20} onClick={() => { }} className="cursor mx-2" />
                <img src="assets/images/deleteIcon.png" height={20} width={20} onClick={() => { }} className="cursor mx-2" />
                <div className={`${data.status === 1 ? 'bg-2ECC71' : data.status === 0 ? 'bg-FFB801' : ''} px-4 py-1 ml-2 rounded-pill`}>
                  <label className='color-white  font-size-13 font-wt-600'>{data.status === 1 ? 'Approved' : data.status === 0 ? 'Pending' : ''}</label>
                </div>
              </div>

            </div>
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
            <button className={`nav-link  bg-transparent ${tab === "User details" && 'active'} paymenttab`} id="nav-home-tab" data-bs-toggle="tab" type="button" role="tab" aria-controls="nav-home" aria-selected="true" onClick={() => setTab("User details")}>User details</button>
            <button className={`nav-link  bg-transparent ${tab === "Referral" && 'active'} paymenttab`} id="nav-profile-tab" data-bs-toggle="tab" type="button" role="tab" aria-controls="nav-profile" aria-selected="false" onClick={() => setTab("Referral")}>Referral</button>
            {/* <button className={`nav-link  bg-transparent ${tab === "Payments" && 'active'} paymenttab`} id="nav-contact-tab " data-bs-toggle="tab" type="button" role="tab" aria-controls="nav-contact" aria-selected="false" onClick={() => setTab("Payments")}>Payments</button> */}
          </div>
        </nav>
      </div>
      <div className="tab-content d-block" id="nav-tabContent" >
        {tab === "User details" && <div className="tab-pane fade show active bg-transparent " id="nav-home" role="tabpanel" >
          <CPDetailsTab userTokenDetails={data} />
        </div>
        }

        {tab === "Referral" && <div className="tab-pane fade show active bg-transparent " id="nav-home" role="tabpanel" >
          <CPReferral userTokenDetails={data} />
        </div>
        }


      </div>
    </>
  )
}

export default ChannelPartnerDetails