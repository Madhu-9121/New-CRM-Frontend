import React, { useState } from 'react'
import { useEffect } from 'react'
import call from '../../service'
import { copyToClipboard } from '../../utils/myFunctions'
import { NewTable } from '../../utils/newTable'

const CPReferral = ({ userTokenDetails }) => {
  const userTypeId = userTokenDetails.type_id ? userTokenDetails.type_id : null
  const userEmail = userTokenDetails.email_id ? userTokenDetails.email_id : null
  const userId = userTokenDetails.id ? userTokenDetails.id : null
  const userName = userTokenDetails.company_name ? userTokenDetails.company_name : null
  const [referraldata, setreferraldata] = useState([])
  const [showLoader, setshowLoader] = useState()
  const getRefferalsList = () => {
    setshowLoader(true)
    call('POST', 'getRefferalsCP', { userId }).then(result => {
      setreferraldata(formatDataForTable(result.message))
      setshowLoader(false)
    }).catch(e => {
      setshowLoader(false)
    })
  }
  useEffect(() => {
    getRefferalsList()
  }, [])
  function formatDataForTable(data) {
    let obj = {
      "19": "Exporter",
      "8": "Bank",
      "20": "Channel Partner"
    }
    let tableData = []
    let row = []
    data.forEach((item, index) => {
      row[0] = obj[item.type_id]
      row[1] = item.company_name
      row[2] = `${item.name_title ? item.name_title : ''} ${item.contact_person ? item.contact_person : ''}`
      row[3] = `${item.phone_code ? "+" + item.phone_code : ''} ${item.contact_number ? item.contact_number : ''}`
      row[4] = item.company_country ? item.company_country : '-'
      row[5] = item.notification_description ? <span className='color3DB16F'>{item.notification_description}</span> : <span className='colorFE4141'>Inactive</span>

      tableData.push(row)
      row = []
    })
    return tableData
  }
  return (
    <>
      <div className='card border-0 chatlist p-4 mt-4'>
        <div className='d-flex flex-row justify-content-between align-items-center'>
          <div className='font-size-14 font-wt-600  text-decoration-underline'>Referrals</div>
          <div className='d-flex flex-row gap-2 align-items-center'>
            <label className='font-size-14 mb-0 font-wt-600 text-color1 text-decoration-underline'>{`Code: `}<span id='referCode' className='font-size-14 mb-0 font-wt-600 text-color1 text-decoration-underline'>{userTokenDetails.refercode}</span></label>
            <img src={"/assets/images/copy_svg.svg"} alt="" className="ps-2 cursor" onClick={() => copyToClipboard("referCode")} />
          </div>

        </div>
        <div className='mt-4'>
          <NewTable
            disableAction
            columns={[
              { name: "Category", filter: true },
              { name: "Company Name", filter: true },
              { name: "Contact Person", filter: false },
              { name: "Contact no.", filter: false },
              { name: "Country", filter: false },
              { name: "Status", filter: false },
              { name: "", filter: false }
            ]}
            data={referraldata}
          />
        </div>

      </div>
    </>
  )
}

export default CPReferral