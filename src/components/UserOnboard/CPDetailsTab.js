import React, { useState } from 'react'
import { useEffect } from 'react'
import { ToastContainer } from 'react-toastify'
import call from '../../service'
import { FileInput } from '../../utils/FileInput'
import { convertImageToPdf, getDocDetails, isEmpty } from '../../utils/myFunctions'
import { NewSelect } from '../../utils/newInput'
import toastDisplay from '../../utils/toastNotification'
import config from '../../config.json'
const reviewForm = [
  { "name": "Contact Person Name", val: "contactPerson", unit: 'name_title' },
  { "name": "Contact Number", val: "contact_number", unit: "phone_code" },
  { "name": "Email ID", val: "email_id" },
  { "name": "Address", val: "user_address" },
  { "name": "City,State", val: ["companyCity", "companyState"], isMultipleKeys: true },
  { "name": "Postal code", val: "companyPostal" },
]

export const KYCUploads = [
  { name: "PAN card", val: "PAN_Document" },
  { name: "Aadhar card", val: "Aadhaar_Document" }

]

const CPDetailsTab = ({ userTokenDetails }) => {

  const [data, setData] = useState({})
  const [errors, setErrors] = useState({})
  const [showLoader, setshowLoader] = useState(false)
  const [KYCDocuments, setKYCDocuments] = useState([])
  const [agreementTemplate, setAgreementTemplate] = useState({})
  const [FinTechAgreement, setFinTechAgreement] = useState({})

  const [refId, setRefId] = useState("")
  const [dbdata, setDbdata] = useState({})
  const userTypeId = userTokenDetails.type_id ? userTokenDetails.type_id : null
  const userEmail = userTokenDetails.email_id ? userTokenDetails.email_id : null
  const userId = userTokenDetails.id ? userTokenDetails.id : null
  const userName = userTokenDetails.company_name ? userTokenDetails.company_name : null

  function getAgreementTemplate(type) {
    return new Promise((resolve, reject) => {
      call('POST', 'getChannelPartnerAgreementTemplate', { role: "CP", type }).then(async (result) => {
        console.log("api result in getChannelPartnerAgreementTemplate-->", result)
        if (result.file_hash) {
          setAgreementTemplate(result)
          try {
            const res = await call('POST', 'getDoc', { 'fileHash': result.file_hash })
            result["filebase64"] = res.filebase64
          } catch (e) {
            console.log('error in getDoc', e)
          }
          resolve({
            doc_id: result.id,
            doc_name: result.doc_name,
            filebase64: result.filebase64,
            name: result.file_name,
            signatureId: null
          })
          // setData({
          //   ...data,
          //   cp_agreement: {
          //     doc_id: result.id,
          //     doc_name: result.doc_name,
          //     filebase64: result.filebase64,
          //     name: result.file_name,
          //     signatureId: null
          //   }
          // })
        }
        else {
          setAgreementTemplate({})
        }
      }).catch((e) => {
        resolve({})
        // console.log("Error while querying getChannelPartnerAgreementTemplate:", e);
      })
    })

  }
  const getduallysignedAgreement = async (tbldocid) => {
    if (tbldocid) {
      try {
        const docdetails = await call('POST', 'getdocdetails', { tbldocid })
        if (docdetails) {
          const result = await call('POST', 'getDoc', { 'fileHash': docdetails.file_hash })
          const fileObj = {
            doc_id: docdetails.id,
            doc_name: docdetails.mst_doc_name,
            filebase64: result.filebase64,
            name: docdetails.file_name,
            signatureId: null
          }
          setFinTechAgreement(fileObj)
        }
      } catch (e) {
        console.log('error in api', e)
      }

    }
  }
  const handleChange = async (event) => {
    event.persist()
    setData({ ...data, [event.target.name]: event.target.value })
    setErrors({ ...errors, [event.target.name]: "" })
  }
  const handleFile = (event, isImage) => {
    event.persist()
    if (!event.target.files.length) {
      return null
    }
    else {
      let file_type = event.target.files[0]["type"].toLowerCase()
      if (!((file_type.includes("pdf")) || (file_type.includes("png")) || (file_type.includes("jpeg")))) {
        setErrors({ ...errors, [event.target.name]: "Files with pdf, png & jpeg extension are allowed" })
        return
      }
      console.log('Fileddatataaaa', event.target.files)

      let reader = new FileReader();
      reader.readAsDataURL(event.target.files[0]);
      reader.onloadend = async (e) => {
        let fileObj = event.target.files[0]
        let fileDataUrl = e.target.result

        if (!file_type.includes("pdf") && !isImage) {
          let response = await convertImageToPdf(fileDataUrl, event.target.files[0]["name"]);
          console.log("pdfconversionresp", response);
          fileObj = response["file"]
          fileDataUrl = response['dataUrl']
          toastDisplay("File converted into pdf format", "success")
        }
        fileObj["filebase64"] = fileDataUrl
        if (event.target.name === 'cp_agreement') {
          submitDoc(fileObj)
        }
        setData({ ...data, [event.target.name]: fileObj })
        setErrors({ ...errors, [event.target.name]: "" });
      }
    }
  }

  const getUserProfileData = () => {
    let reqObj = {
      "email": userEmail,
      "kyc": true
    }
    call('POST', 'getuserprofiledata', reqObj).then(async (result) => {
      console.log('running getuserprofiledata api-->', data);
      let kycDocs = {}
      for (let i = 0; i <= result.userKYCData.length - 1; i++) {
        let KYCdata = result.userKYCData[i]
        const res = await getDocDetails(KYCdata.tbl_doc_id)

        if (res.filebase64) {
          kycDocs[KYCdata.doc_name.split(' ').join('_')] = {
            ...res,
            name: KYCdata.file_name
          }
        }
      }
      console.log('KYCDataaaaaaaaa2', kycDocs)
      const cp_agreement = await getAgreementTemplate(result.userProfileData.tech_type_id)
      setKYCDocuments(result.userKYCData)
      getUserDetailsExtra({
        user_name: result.userProfileData.user_name,
        contact_number: result.userProfileData.contact_number,
        phone_code: result.userProfileData.phone_code,
        name_title: result.userProfileData.name_title,
        user_address: result.userProfileData.user_address,
        email_id: result.userProfileData.email_id,
        user_avatar: result.userProfileData.user_avatar ? result.userProfileData.user_avatar : null,
        company_name: result.userProfileData.company_name,
        organization_type: result.userProfileData.organization_type,
        industry_type: result.userProfileData.industry_type,
        pan_no: result.userProfileData.pan_no,
        gst_vat_no: result.userProfileData.gst_vat_no,
        iec_no: result.userProfileData.iec_no,
        cin_no: result.userProfileData.cin_no,
        aadhar_no: result.userProfileData.aadhar_no,
        company_pan_verification: result.userProfileData.company_pan_verification,
        company_cin_verification: result.userProfileData.company_cin_verification,
        company_gst_verification: result.userProfileData.company_gst_verification,
        company_iec_verification: result.userProfileData.company_iec_verification,
        kyc_done: (result.userProfileData.kyc_done / 1),
        country: result.userProfileData.country_code,
        contactPerson: result.userProfileData.contact_person,
        designation: result.userProfileData.designation,
        companyPostal: result.userProfileData.company_postal_code,
        companyCity: result.userProfileData.company_city,
        companyAdd1: result.userProfileData.company_address1,
        companyAdd2: result.userProfileData.company_address2,
        companyState: result.userProfileData.company_state,
        CompanyCountry: result.userProfileData.company_country,
        ...kycDocs,
        referralCode: result.userProfileData.refercode,
        tech_type_id: result.userProfileData.tech_type_id,
        userId: result.userProfileData.tbl_user_id,
        cp_agreement: cp_agreement

      })
    }).catch((e) => {
      console.log('error in getuserprofiledata', e);
    });
  }
  const getUserDetailsExtra = async (extraDetails) => {
    let reqObj = {
      "userId": userId,
    }
    try {
      const result = await call('POST', 'getuserdetailsextra', reqObj)
      console.log('running getuserdetailsextra api-->', result);
      let businessDocuments = {}
      for (let i = 0; i <= result.docDetails.length - 1; i++) {
        let BusinessDoc = result.docDetails[i]
        const res = await getDocDetails(BusinessDoc.id)
        console.log('BusinessDocs', res)
        if (res.filebase64) {
          businessDocuments[BusinessDoc.doc_name] = {
            ...res,
            name: BusinessDoc.file_name
          }
        }
      }
      setData({
        ...extraDetails,
        company_email: result.userDetails.company_email,
        website: result.userDetails.website,
        dunsNo: result.userDetails.dunsNo,
        country_of_incorporation: result.userDetails.country_of_incorporation,
        country_of_operation: result.userDetails.country_of_operation,
        minExisting: result.userDetails.minExisting,
        minExpected: result.userDetails.minExpected,
        ...businessDocuments,
        ExisExportTurnover: result.userDetails.ExisExportTurnover,
        ExpecExportTurnover: result.userDetails.ExpecExportTurnover,
        ExisDomesTurnover: result.userDetails.ExisDomesTurnover,
        ExpecDomesTurnover: result.userDetails.ExpecDomesTurnover,
        currency: result.userDetails.currency
      })
    } catch (e) {
      console.log('error in getuserdetailsextra', e);
    }

  }
  useEffect(() => {
    getUserProfileData()
    getSingleUserByReq()
  }, [])


  const updateDocs = async () => {
    setshowLoader(true)
    try {
      const formData = new FormData()
      formData.append('userTypeId', userTypeId)
      formData.append('userId', userId)
      formData.append('email', data.email_id)
      formData.append('contactNo', data.contact_number)
      formData.append('address', data.user_address)
      formData.append('userName', data.user_name)
      formData.append('avatarFile', data.user_avatar)
      const profilekycdocs = [KYCUploads[0], KYCUploads[4]]
      profilekycdocs.forEach(kycuploads => {
        if (data[kycuploads.val] !== undefined && data[kycuploads.val] !== null) {
          const KYCData = KYCDocuments.find(data => kycuploads.val === data.doc_name.split(' ').join('_'))
          console.log('MatchFound', KYCData)
          let payloadUpload = {}
          if (KYCData) {
            payloadUpload = {
              uploadingUser: userId,
              kycUserId: userId,
              userTypeName: '',
              id: KYCData.id ? KYCData.id : '',
              tbl_doc_id: KYCData.tbl_doc_id ? KYCData.tbl_doc_id : '',
              contract_id: "",
              linked_to: KYCData.linked_to,
              isUpdateQuery: KYCData.doc_status === 1 ? true : false,
              prevFileHash: KYCData.file_hash,
              categoryId: KYCData.category_id,
              type: '',
              filePayload: {
                docNo: KYCData.doc_no,
                docName: KYCData.doc_name,
                genDocLabel: (KYCData.doc_status === 1 && KYCData.doc_type === 1) ? KYCData.gen_doc_label : '',
                docType: KYCData.doc_type,
                validUpto: KYCData.valid_upto
              }
            }
          } else {
            payloadUpload = {
              uploadingUser: userId,
              kycUserId: userId,
              userTypeName: '',
              contract_id: "",
              linked_to: 1,
              isUpdateQuery: false,
              prevFileHash: '',
              categoryId: 2,
              type: '',
              filePayload: {
                docNo: '',
                docName: kycuploads.val.split('_').join(' '),
                genDocLabel: '',
                docType: 1,
                validUpto: null
              }
            }

          }
          payloadUpload = JSON.stringify(payloadUpload);
          let formData = new FormData();
          formData.append('payloadUpload', payloadUpload);
          formData.append('doc', data[kycuploads.val])
          console.log('Doctypeeeeeeee', data[kycuploads.val], data[kycuploads.val] && data[kycuploads.val].fromDb)
          if (!(data[kycuploads.val] && data[kycuploads.val].fromDb)) {
            call('POST', 'updateDoc', formData).then((result) => {
              setshowLoader(false)
              if (result) {
                toastDisplay(kycuploads.name + " Uploaded", "success");
              }
            }).catch(err => {
              setshowLoader(false)
              console.log("conn:", err)
              toastDisplay("Failed to upload " + kycuploads.name, "error");
            })
          } else {
            setshowLoader(false)
          }
        } else {
          setshowLoader(false)
        }
      })
      getUserProfileData()
    } catch (error) {
      console.log('error in updatedocs', error)
      setshowLoader(false)
    }

  }

  function submitDoc(fileobj) {
    setshowLoader(true)
    let formData = new FormData();
    formData.append('file', fileobj);
    formData.append('doc_name', fileobj.name);
    formData.append('role', "CP");
    formData.append('type', 5);
    call('POST', 'addChannelPartnerAgreementTemplate', formData).then((result) => {
      toastDisplay("Template uploaded", "success")
      setshowLoader(false)
    }).catch((error) => {
      // console.log("error occur in addUserOtherDocs ->", error)
      setshowLoader(false)
    })
  }

  function deleteDoc() {
    setshowLoader(true)
    call('POST', 'deleteChannelPartnerAgreementTemplate', { id: agreementTemplate.id }).then((result) => {
      toastDisplay("Template removed", "success")
      setAgreementTemplate({})
      setshowLoader(false)
    }).catch((error) => {
      // console.log("error occur in deleteChannelPartnerAgreementTemplate ->", error)
      setshowLoader(false)
    })
  }

  function submitAgreement() {
    let errors = {}
    if (!data.cp_designation) {
      errors.cp_designation = 'Mandatory Field'
    }
    if (!data.contact_number?.length === 10) {
      errors.contact_number = 'Contact Number must be 10 digit'
    }
    if (!isEmpty(errors)) {
      setErrors(errors)
      return
    }
    setshowLoader(true)

    let reqObj = {
      techTypeId: data.tech_type_id,
      baseUrl: config.baseUrl,
      status: true,
      userData: {
        ...dbdata.userData,
        userId: userId,
        email: userEmail
      },
      reqId: refId,
      agreementFileHash: agreementTemplate.file_hash,
      party_designation: data.cp_designation,
      company_name: data.company_name,
      contact_person: data.contact_person,
      organization_type: data.organization_type,
      role: "CP",
      pan_no: data.pan_no,
      aadhar_no: data.aadhar_no,
      typeId: 20,
      country_code: data.country_code,
      email_id: data.email_id,
      address: data.user_address
    }

    call('POST', 'submitAgreement', reqObj).then((result) => {
      if (result) {
        toastDisplay('Agreement successfully submitted', 'success')
      }
      setshowLoader(false)
    }).catch((e) => {
      setshowLoader(false)
      console.log('error in submitAgreement', e);
      toastDisplay('Failed to submit agreement', 'success')
    })
  }

  function getSingleUserByReq() {
    call('POST', 'getSingleUserByReq', { id: userId }).then(result => {
      setRefId(result[0].id)
      setDbdata(result[0])
    }).catch(e => {

    })
  }
  useEffect(() => {
    getduallysignedAgreement(dbdata.agreement_doc_id)
  }, [dbdata])
  return (
    <>
      {showLoader && (<div className="loading-overlay"><span><img className="" src="assets/images/loader.gif" alt="description" /></span></div>)}
      <ToastContainer position="bottom-right" autoClose={5000} hideProgressBar={false} newestOnTop closeOnClick rtl={false} pauseOnVisibilityChange draggable pauseOnHover />

      <div className='card border-0 chatlist p-4 mt-4'>
        <div className='row'>

          <div className='col-md-12'>
            <div className="row">
              {reviewForm.map((item) => {
                return (
                  <div className="col-md-6">
                    <p className="d-flex align-items-top mb-2"><span className="col-md-5 px-0 BuyerdetailsLabel">{item.name}</span><span className="mx-3">:</span><span className="col-md-7 BuyerdetailsDesc" > {
                      item.isMultipleKeys ? item.val.map(item => data[item]).join(",")
                        : data[item.val] ? (item.unit ? `${data[item.unit] ? data[item.unit] : ''} ` : "") + (data[item.val]) : "NA"}</span> </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>
      <div className='card border-0 chatlist p-4 mt-4'>
        <p className='font-size-14 font-wt-600  text-decoration-underline'>Documents</p>
        <div className='row'>
          {dbdata.status === 4 &&
            <div className="col-md-4">
              <label className="font-size-13">{"Partnersheep Agreement"}</label>
              <div className="row form-group">
                <div className="col-md-11">
                  <FileInput value={FinTechAgreement}
                    isEditable={false} userTokenDetails={userTokenDetails}
                  />
                </div>
              </div>
            </div>
          }
          {KYCUploads.map(kycData => {
            return <div className="col-md-4">
              <label className="font-size-13">{kycData.name}</label>
              <div className="row form-group">
                <div className="col-md-11">
                  <FileInput name={kycData.val} value={data[kycData.val]} error={errors[kycData.val]}
                    onChange={handleFile} isEditable={true} userTokenDetails={userTokenDetails}
                    onUploadCancel={() => setData({ ...data, [kycData.val]: null })}
                  />
                  {errors[kycData.val] ? <div class="text-danger mt-2 font-size-12">
                    <i class="fa fas fa-exclamation-circle mr-1" aria-hidden="true"></i>
                    <b>{errors[kycData.val]}</b></div> : ''}
                </div>
              </div>
            </div>
          })
          }
          <div className="d-flex gap-4">
            <button className={`my-4 new-btn w-17 py-2 px-2 text-white cursor`} onClick={updateDocs}>Save</button>
          </div>
        </div>
      </div>
      {dbdata.status != 4 &&
        <div className='card border-0 chatlist p-4 mt-4'>
          <p className='font-size-14 font-wt-600  text-decoration-underline'>Agreement</p>
          <div className='row'>
            <div className="col-md-4">
              <div className="col-md-10 px-0">
                <NewSelect isAstrix={true} label={"Designation"}
                  selectData={[
                    { name: "Proprietor" },
                    { name: "Partner" },
                    { name: "Director" },
                  ]} name={"cp_designation"}
                  value={data.cp_designation} optionLabel={"name"} optionValue={'name'}
                  onChange={handleChange} error={errors.cp_designation} />
              </div>
            </div>
            <div className="row form-group col-md-4">
              <div className="">
                <FileInput name={"cp_agreement"} value={data.cp_agreement} error={errors.cp_agreement}
                  onChange={handleFile} isEditable={true} userTokenDetails={userTokenDetails}
                  onUploadCancel={() => {
                    setData({ ...data, "cp_agreement": null })
                    deleteDoc()
                  }}
                />
                {errors.cp_agreement ? <div class="text-danger mt-2 font-size-12">
                  <i class="fa fas fa-exclamation-circle mr-1" aria-hidden="true"></i>
                  <b>{errors.cp_agreement}</b></div> : ''}
              </div>
            </div>
            <div className="col-md-4">
              <button className={`new-btn px-4 py-2 my-1 text-white cursor`} onClick={() => {
                if (dbdata.status == 3) {
                  //disabled
                } else if (dbdata.status != 4) {
                  submitAgreement()
                }
              }}>{dbdata.status == 3 ? 'Already Submitted' : dbdata.status != 4 ? 'Submit' : ''}</button>
            </div>
          </div>
        </div>
      }

      {/* <div className='card border-0 chatlist p-4 mt-4'>
        <div className='d-flex flex-row justify-content-between align-items-center'>
          <div className='font-size-14 font-wt-600  text-decoration-underline'>Users</div>
          <div className="d-flex gap-4">
            <button className={`new-btn  py-2 px-2 text-white cursor`} onClick={() => setSubUserModal(true)}>Add New User</button>
          </div>
        </div>
        <div className='mt-4'>
          <NewTable
            disableAction
            columns={[
              { name: "Name", filter: true },
              { name: "Contact no.", filter: true },
              { name: "Email ID", filter: false },
              { name: "Access", filter: false },
              { name: "", filter: false }
            ]}
            data={subUserList}
          />
        </div>
      </div> */}

    </>
  )
}

export default CPDetailsTab