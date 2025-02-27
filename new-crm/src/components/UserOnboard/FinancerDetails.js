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
import NewTablev2 from '../../utils/newTablev2';
import call from '../../service';

const userTabs = [
  "User details",
  "Profile",
  "Supplier",
  "Criteria",
  "Payments",
  "Transactions"
]

const FinancerDetails = ({ data, goBack, userTokenDetails }) => {
  // console.log("dataaaaaaaaaaaaaaaaaaaa", data);
  const [tab, setTab] = useState('User details')
  const [mainUserServices, setMainUserServices] = useState([
    { name: 'Export Factoring', key: 'invoiceEnabled' },
    { name: 'LC', key: 'lcEnabled' },
    { name: 'SBLC', key: 'sblcEnabled' },
    { name: 'Bank Guarantee', key: 'bgEnabled' },
    { name: 'Supply Chain Finance', key: 'scfEnabled' },
    { name: 'Working Capital', key: 'wcEnabled' },
    { name: 'CGTMSE', key: 'cgtmseEnabled' },
    { name: 'Insurance', key: 'insuranceEnabled' }
  ])
  const [financierServicesData, setFinancerServicesData] = useState({})

  useEffect(() => {
    call('POST', 'getFinancierMetadata', { finId: data.id }).then(res => {
      setFinancerServicesData(res)
    })
  }, [])

  async function updateFinancierServicesData() {
    call('POST', 'updateFinancierMetadata', { finId: data.id, services: financierServicesData }).then(res => {
      toastDisplay('Saved', "success")
    }).catch(err => {
      toastDisplay("Something went wrong", "error")
    })
  }

  return (
    <>
      <ToastContainer position="bottom-right" autoClose={5000} hideProgressBar={false} newestOnTop closeOnClick rtl={false} pauseOnVisibilityChange draggable pauseOnHover />
      <div className="col-md-5">
        <div className="d-flex flex-row align-items-center justify-content-between">
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
            </div>
          </div>
        </div>
      </div>
      <div className='mt-4'>
        <nav>
          <div className="nav nav-tabs signdoctabs gap-4 border-0" id="signdoctabs" role="tablist">
            <button className={`nav-link  bg-transparent ${tab === "User details" && 'active'} paymenttab`} id="nav-home-tab" data-bs-toggle="tab" type="button" role="tab" aria-controls="nav-home" aria-selected="true" onClick={() => setTab("User details")}>User details</button>
            <button className={`nav-link  bg-transparent ${tab === "Profile" && 'active'} paymenttab`} id="nav-profile-tab" data-bs-toggle="tab" type="button" role="tab" aria-controls="nav-profile" aria-selected="false" onClick={() => setTab("Profile")}>Profile</button>
            <button className={`nav-link  bg-transparent ${tab === "Supplier" && 'active'} paymenttab`} id="nav-contact-tab " data-bs-toggle="tab" type="button" role="tab" aria-controls="nav-contact" aria-selected="false" onClick={() => setTab("Supplier")}>Supplier</button>
            <button className={`nav-link  bg-transparent ${tab === "Criteria" && 'active'} paymenttab`} id="nav-contact-tab " data-bs-toggle="tab" type="button" role="tab" aria-controls="nav-contact" aria-selected="false" onClick={() => setTab("Criteria")}>Criteria</button>
            <button className={`nav-link  bg-transparent ${tab === "Payments" && 'active'} paymenttab`} id="nav-contact-tab " data-bs-toggle="tab" type="button" role="tab" aria-controls="nav-contact" aria-selected="false" onClick={() => setTab("Payments")}>Payments</button>
            <button className={`nav-link  bg-transparent ${tab === "Transactions" && 'active'} paymenttab`} id="nav-contact-tab " data-bs-toggle="tab" type="button" role="tab" aria-controls="nav-contact" aria-selected="false" onClick={() => setTab("Transactions")}>Transactions</button>
          </div>
        </nav>
      </div>
      <div className="tab-content d-block" id="nav-tabContent" >
        {tab === "User details" && <div className="tab-pane fade show active bg-transparent " id="nav-home" role="tabpanel" >
          <UserDetailsTab userTokenDetails={data} />
        </div>
        }
        {tab === "Profile" && <div className="tab-pane fade show active bg-transparent " id="nav-home" role="tabpanel" >
          {!data.parent_id ?
            <div className='card border-0 chatlist p-4 mt-4'>
              <label className='font-size-14 font-wt-600 w-100' ><u>Access Control for Financial Services</u></label>
              <div className='mt-3'>
                <NewTablev2
                  columns={[{ subColumns: "Service Name", subColumnStyle: { width: '90%' } }, { subColumns: "Access", subColumnStyle: { width: '10%' } }]}
                >
                  {mainUserServices.map((i, j) => {
                    return (
                      <tr>
                        <td><label className='font-size-14 font-wt-500 text-break' >{i.name}</label></td>
                        <td><img className='cursor'
                          onClick={() => { setFinancerServicesData({ ...financierServicesData, [i.key]: !financierServicesData[i.key] }) }}
                          src={`assets/images/${financierServicesData?.[i.key] ? 'checked_vector' : 'unchecked_vector'}.svg`}
                          height={21} width={21}
                        /></td>
                      </tr>
                    )
                  })}
                </NewTablev2>
                <div className="">
                  <button type="button"
                    onClick={updateFinancierServicesData}
                    className={` new-btn w-17 py-2 px-2  text-white`}>
                    {"Submit"}
                  </button>
                </div>
              </div>
            </div> : null}
          <UserProfileTab userTokenDetails={data} />
        </div>
        }
        {tab === "Supplier" && <div className="tab-pane fade show active bg-transparent " id="nav-home" role="tabpanel" >
          <SupplierList userTokenDetails={{
            type_id: data.type_id,
            email: data.email_id,
            user_id: data.id,
            userName: data.company_name
          }} renderAsComponent={true} />
        </div>
        }
        {tab === "Criteria" && <div className="tab-pane fade show active bg-transparent " id="nav-home" role="tabpanel" >
          <CreditLineTab userTokenDetails={{ user_id: data.id }} toastDisplay={toastDisplay} />

        </div>
        }
        {tab === "Payments" && <div className="tab-pane fade show active bg-transparent " id="nav-home" role="tabpanel" >
          <FinPayment userTokenDetails={{
            user_id: data.id,
            userName: data.company_name,
            type_id: data.type_id
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

export default FinancerDetails