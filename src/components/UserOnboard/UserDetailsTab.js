import React, { useState } from 'react'
import { useEffect } from 'react'
import { ToastContainer, toast } from 'react-toastify'
import call from '../../service'
import { FileInput } from '../../utils/FileInput'
import { ExportExcel, convertImageToPdf, copyToClipboard, getDocDetails, getFiscalYearDates, getFiscalYearsDropdown, gettotalCount, isEmpty, most_used_currencies } from '../../utils/myFunctions'
import { NewTable } from '../../utils/newTable'
import toastDisplay from '../../utils/toastNotification'
import { BusinessDocs } from '../viewProfile/components/companyTab'
import SubUserModal from '../viewProfile/components/SubUserModal'
import { KYCUploads } from '../viewProfile/viewProfile'
import moment from 'moment'
import { InputWithSelect, NewInput, NewSelect } from '../../utils/newInput'
import { companyTypes, industryData } from '../registration/newRegistration'
import { useRef } from 'react'
import PieChartComponent from '../Reports/components/PieChartComponent'
import CustomLineChart from '../CRM/CustomLineChart'
import { platformBackendUrl } from '../../urlConstants'
import axios from 'axios'
import { auditorForm } from '../CRM/CRMUserDetails'
const fiscalyears = getFiscalYearsDropdown()
const countriesColor = ['#8B1170', '#C134A2', '#E96DCD', '#FF8BE6', '#FFC0F1']
const lanesColor = ['#8B4C11', '#A8672B', '#CD8F55', '#ECB27D', '#F4D0AE']
const shipmentsFrom = ['#11708B', '#1B94B7', '#4DBFE0', '#76DDFB', '#AFEDFF']
const shipmentsTo = ['#118B49', '#27B96A', '#59DC95', '#7AF5B3', '#A6FFCF']
const reviewForm = [
  { "name": "Contact Person Name", val: "contactPerson", unit: 'name_title' },
  { "name": "Contact Number", val: "contact_number", unit: "phone_code" },
  { "name": "Email ID", val: "email_id" },
  { "name": "Organization Type", val: "organization_type" },
  { "name": "Industry Type", val: "industry_type" },
  { "name": "Address", val: "user_address" },
  { "name": "City,State", val: ["companyCity", "companyState"], isMultipleKeys: true },
  { "name": "Postal code", val: "companyPostal" },
]

const reviewForm2 = [
  { "name": "Country of incorporation", val: "country_of_incorporation" },
  { "name": "Country of operation", val: "country_of_operation" },
  { "name": "Years of incorporation", val: "years_of_incorporation", calculate: (d) => { return moment().diff(moment("2016-09-15", "YYYY-MM-DD"), "years") } },
  { "name": "Last years net profit", val: "prevNetProfit", unit: "currency" },
  { "name": "Existing turnover", val: "ExisExportTurnover", unit: "currency" },
  { "name": "Expected turnover", val: "ExpecExportTurnover", unit: "currency" },
  { "name": "Date of Incorportation", val: "dateOfIncorporation" },
  { "name": "Exporter Type", val: "categoryOfExporters" },
  { "name": "Export Turn Over (USD)", val: "exportTurnOver" }
]

const reviewForm3 = [
  { "name": "GST number", val: "gst_vat_no" },
  { "name": "IEC", val: "iec_no" },
  { "name": "CIN No.", val: "cin_no" },
  { "name": "PAN No.", val: "pan_no" },
  { "name": "Duns No.", val: "dunsNo" },
]

const docsFormArray = [
  { "key": "MOM_Document", "name": "MOM Document", "dbId": ":9:44" },
  { "key": "AOA_Document", "name": "AOA Document", "dbId": ":9:45" },
  { "key": "Shareholding_Document", "name": "Shareholding Document", "dbId": ":9:46" },
  { "key": "Partnership_Deed_Document", "name": "Partnership Deed Document", "dbId": ":9:47" },
  { "key": "Company_Profile_Document", "name": "Company Profile Document", "dbId": ":9:48" },
]

const UserDetailsTab = ({ userTokenDetails, setEditPopup, editPopup }) => {
  let todayDateObj = moment()
  let lastMonthDateObj = moment().subtract("1", "year")
  const [data, setData] = useState({})
  const [errors, setErrors] = useState({})
  const [subUserList, setsubUserList] = useState([])
  const [showLoader, setshowLoader] = useState(false)
  const [referraldata, setreferraldata] = useState([])
  const [subUserModal, setSubUserModal] = useState(false)
  const [countrys, setCountrys] = useState([])
  const [KYCDocuments, setKYCDocuments] = useState([])
  const [viewdetails, setviewdetails] = useState({
    isVisible: false,
    data: {}
  })
  const [gstBranchList, setgstBranchList] = useState([])
  const [hscodesdata, sethscodesdata] = useState([])
  const [hscodesCount, sethscodesCount] = useState(0)
  const [hscodesrefresh, sethscodesRefresh] = useState(0)
  const [hscodespage, sethscodesPage] = useState(1)
  const [HSDetails, setHSDetails] = useState({
    show: false,
    data: [],
    selectedHS: null
  })
  const [countriesPopup, togglecountriesPopup] = useState({ show: false, data: [] })
  const [buyersPopup, togglebuyersPopup] = useState({ show: false, data: [] })
  const [activeIndex, setActiveIndex] = useState(0);
  const [hsExpanded, setHSExpanded] = useState({})
  const [graphTableMode, setGraphTableMode] = useState({})
  const [graphColumns, setGraphColumns] = useState({})
  const [tab, setTab] = useState({})
  const [graphConfiguration, setGraphConfiguration] = useState({})
  const [exportHistoryTableData, setexportHistoryTableData] = useState({})
  const [priceHistoryTableData, setPriceHistoryTableData] = useState({})
  const [graphdata, setgraphdata] = useState({})
  const graphdataRef = useRef({})
  const [chartconfig, setChartConfig] = useState({})
  const chartconfigRef = useRef({})
  const [exportHistory, setexportHistory] = useState({})
  const exportHistoryRef = useRef({})
  const [exportchartconfig, setexportchartconfig] = useState({})
  const exportchartconfigRef = useRef({})
  const [quantitychartconfig, setquantitychartconfig] = useState({})
  const quantitychartconfigRef = useRef({})
  const [countriesChart, setCountriesChart] = useState({})
  const countriesChartRef = useRef({})
  const [lanesChart, setlanesChart] = useState({})
  const lanesChartRef = useRef({})
  const [shipmentsFromChart, setshipmentsFromChart] = useState({})
  const shipmentsFromChartRef = useRef({})
  const [shipmentsToChart, setshipmentsToChart] = useState({})
  const shipmentsToChartRef = useRef({})
  const [countriesFilter, setCountriesFilter] = useState({})
  const [lanesFilter, setLanesFilter] = useState({})
  const [shipmentsFromFilter, setShipmentsFromFilter] = useState({})
  const [shipmentsToFilter, setShipmentsToFilter] = useState({})
  const [addmoreContacts, setAddMoreContacts] = useState(false)
  const [isEditContact, setIsEditContact] = useState({
    isEdit: false,
    _id: ""
  })
  const modalRef = useRef(null)

  const [EXPORTER_CODE, setExporterCode] = useState(null)
  const [countrydata, setCountrydata] = useState([])

  const [getdetails, setdetails] = useState({});
  const [showfetch, setshowfetch] = useState(true)
  const [refresh, setRefresh] = useState(0);
  const [refreshContacts, setRefreshContacts] = useState(0);
  const [isAuditorExpanded, setIsAuditorExpanded] = useState(true);


  const userTypeId = userTokenDetails.type_id ? userTokenDetails.type_id : null
  const userEmail = userTokenDetails.email_id ? userTokenDetails.email_id : null
  const userId = userTokenDetails.id ? userTokenDetails.id : null
  const userName = userTokenDetails.company_name ? userTokenDetails.company_name : null
  let EXP_NAME = userName
  if (userName.includes("Private Limited")) {
    EXP_NAME = userName.replace(/Private Limited/g, "PVT LTD");
  } else if (userName.includes("Limited")) {
    EXP_NAME = userName.replace(/Limited/g, "LTD");
  }
  let EXPORTER_NAME = EXP_NAME.replace(/LTD\d*/g, "LTD");
  const handleAccordianClick = (index) => {
    setActiveIndex(index === activeIndex ? null : index);
  };
  const [contactstable, setcontactstable] = useState([])
  const [shouldFetchLeadGenData, toggleShouldFetchLeadGenData] = useState(true)

  const formatdataforcontactstable = (data) => {
    let tableData = []
    let row = []
    data?.forEach((key, index) => {
      row[0] = key['Contact Person'] ? key['Contact Person'] : '-'
      row[1] = key['Designation'] ? key['Designation'] : "-"
      row[2] = key['Contact Number'] ? key['Contact Number'] : "-"
      row[3] = key['Email ID'] ? key['Email ID'] : "-"
      row[4] = key['Action'] ? key['Action'] : "-"
      row[5] = <div className='d-flex gap-2'>
        <img src='assets/images/edit-icon.svg' height={20} width={20} onClick={() => {
          setData({
            ...data,
            contactNo: key["Contact Number"],
            contact_person: key["Contact Person"],
            department: key["Department"],
            designation: key["Designation"],
            email_id: key["Email ID"]
          })
          setAddMoreContacts(true)
          setIsEditContact({
            isEdit: true,
            _id: key._id
          })
        }} />
        <img src='assets/images/downloadBu.svg' height={20} width={20} onClick={() => {
          ExportExcel([key], 'Contact_details')
        }} />
      </div>
      tableData.push(row)
      row = []
    })
    return tableData
  }

  console.log("data for user", data)
  console.log("getdetails for user", getdetails)
  useEffect(() => {
    getContactDetailsByName()
  }, [refreshContacts])

  useEffect(() => {
    const fetchData = () => {
      console.log("hello karza");
      const exporterName = userTokenDetails.company_name;
      console.log(exporterName, "expname");
      setshowLoader(true);
      call("POST", "getTraderfromKarza", {
        exporterName: exporterName,
      })
        .then((response) => {
          setshowLoader(false);
          setdetails(response);
          setshowfetch(false)
          console.log(response, "ressssspppoonnsseee"); // Log the response data
        })
        .catch((error) => {
          setshowLoader(false);
          console.error("Error fetching data:", error);
        });
    };

    fetchData();
  }, [refresh]);

  const handleFetchData = () => {
    console.log("hello karza");
    const exporterName = userTokenDetails.company_name;
    console.log(exporterName, "expname");
    setshowLoader(true);
    call("POST", "getTraderDetailsFromKarzaApi", {
      exporterName: exporterName,
    })
      .then((response) => {
        setshowLoader(false);
        console.log(response, "response")
        setdetails(response[0]);
        call("POST", "getTraderfromKarza", {
          exporterName: exporterName,
        })
          .then((response) => {
            if (!response?.length) {
              toastDisplay("Data not found", "error")
            }
            setshowLoader(false);
            setdetails(response);
            setshowfetch(false)
            setRefresh(refresh + 1)
            console.log(response, "ressssspppoonnsseee"); // Log the response data
          })

        setshowfetch(false)
        console.log(response, "ressssspppoonnsseee"); // Log the response data
      })
      .catch((error) => {
        setshowLoader(false);
        setRefresh(refresh + 1)
        console.error("Error fetching data:", error);
      });
  };


  const addExtraContactDetails = () => {
    let errors = {}
    if (!data.department && !data.contact_person && !data.designation && !data.contactNo && !data.email_id) {
      errors.department = 'Department cannot be empty'
      errors.contact_person = 'Contact Person cannot be empty'
      errors.designation = 'Designation Cannot be empty'
      errors.contactNo = 'Contact Number cannot be empty'
      errors.email_id = 'Email ID Cannot be empty'
    }
    if (!isEmpty(errors)) {
      setErrors(errors)
    } else {
      setshowLoader(true)
      let reqObj = {
        EXPORTER_CODE: EXPORTER_CODE,
        isUpdate: isEditContact.isEdit,
        contactObject: {
          "Department": data.department,
          "Contact Person": data.contact_person,
          "Designation": data.designation,
          "Contact Number": data.contactNo,
          "Email ID": data.email_id,
          "isPrimary": data.primaryDetails,
          "_id": isEditContact._id
        }
      }
      call('POST', 'addExtraContactDetails', reqObj).then(result => {
        toastDisplay(result, "success")
        setshowLoader(false)
        setAddMoreContacts(false)
        setData({
          ...data,
          contactNo: "",
          contact_person: "",
          department: "",
          designation: "",
          email_id: ""
        })
        getContactDetailsByName()
      }).catch(e => {
        toastDisplay(e, "error")
        setshowLoader(false)
      })
    }
  }

  const getContactDetailsByName = () => {
    setshowLoader(true)
    call('POST', 'getContactDetailsByName', { EXPORTER_NAME: EXPORTER_NAME }).then(result => {
      setshowLoader(false)
      setcontactstable(formatdataforcontactstable(result.EXTRA_DETAILS))
      setExporterCode(result.EXPORTER_CODE)
      toggleShouldFetchLeadGenData(!result.fromLeadGen)
    }).catch(e => {
      setshowLoader(false)

    })
  }
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        // Clicked outside the modal, so close it
        setEditPopup(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, []);
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
        setData({ ...data, [event.target.name]: fileObj })
        setErrors({ ...errors, [event.target.name]: "" });
      }
    }
  }

  useEffect(() => {
    axios.get(platformBackendUrl + "/getallCountry").then((result) => {
      if (result.data.message && result.data.message.length) {
        setCountrydata(result.data.message);
      }
    });
  }, [])

  const getUserProfileData = () => {
    let reqObj = {
      "email": userTokenDetails?.subUserProfileDetails?.parent_email_id || userEmail,
      "kyc": true
    }
    call('POST', 'getuserprofiledata', reqObj).then(async (result) => {
      console.log('running getuserprofiledata api-->', data);
      let userProfileData = result.userProfileData
      let kycDocs = {}
      for (let i = 0; i <= result.userKYCData.length - 1; i++) {
        let KYCdata = result.userKYCData[i]
        //let KYCdata = resultdata[i]
        const res = await getDocDetails(KYCdata.tbl_doc_id)

        if (res.filebase64) {
          kycDocs[KYCdata.doc_name.split(' ').join('_')] = {
            ...res,
            name: KYCdata.file_name
          }
        }
      }
      console.log('KYCDataaaaaaaaa2', kycDocs)

      // result.userKYCData.forEach(async KYCdata => {


      // })
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
        country_code: result.userProfileData.country_code,
        contactPerson: result.userProfileData.contact_person,
        designation: result.userProfileData.designation,
        companyPostal: result.userProfileData.company_postal_code,
        companyCity: result.userProfileData.company_city,
        companyAdd1: result.userProfileData.company_address1,
        companyAdd2: result.userProfileData.company_address2,
        companyState: result.userProfileData.company_state,
        CompanyCountry: result.userProfileData.company_country,
        ...kycDocs,
        referralCode: result.userProfileData.refercode

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
      // Get commercial terms doc start
      try {
        let commercialTermsDocId = await call('POST', 'syndicationTNCStatus', { userId })
        extraDetails["CommercialTerms"] = await getDocDetails(commercialTermsDocId)
      } catch (error) {
        console.log("errorInsyndicationTNCStatus", error);
      }
      // Get commercial terms doc end
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
      // Get user details from iec data start
      let apiResp = await call('POST', 'getUserDetailsFromIEC', { iec: extraDetails.iec_no })
      // Get user details from iec data end
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
        ExisExportTurnover: result.userDetails.minExisting,
        ExpecExportTurnover: result.userDetails.minExpected,
        ExisDomesTurnover: result.userDetails.ExisDomesTurnover,
        ExpecDomesTurnover: result.userDetails.ExpecDomesTurnover,
        currency: result.userDetails.currency,
        years_of_incorporation: result.userDetails.years_of_incorporation,
        prevNetProfit: result.userDetails.prevNetProfit,
        categoryOfExporters: apiResp.categoryOfExporters,
        dateOfIncorporation: apiResp.dateOfIncorporation ? moment(apiResp.dateOfIncorporation).format("YYYY-MM-DD") : null,
        exportTurnOver: apiResp.fobUsd || "NA"
      })
    } catch (e) {
      console.log('error in getuserdetailsextra', e);
    }

  }
  const getRefferalsList = () => {
    setshowLoader(true)
    call('POST', 'getRefferalsList', { userId }).then(result => {
      setreferraldata(formatDataForRefferalTable(result.message))
      setshowLoader(false)
    }).catch(e => {
      setshowLoader(false)
    })
  }
  useEffect(() => {
    getUserProfileData()
    getSubUsers()
    getRefferalsList()
    getCountrydata()
    getBranchesData()
  }, [])
  const getSubUsers = () => {
    call('POST', 'getSubUsers', { parent_id: userId }).then(result => {
      setsubUserList(formatDataForTable(result))
    }).catch(e => {
      console.log('eror in getSubUsers', e)
    })
  }

  function formatDataForRefferalTable(data) {
    let obj = {
      "19": "Exporter",
      "8": "Bank",
      "20": "Channel Partner"
    }
    let tableData = []
    let row = []
    data.forEach((item, index) => {

      row[0] = `${item.name_title ? item.name_title : ""} ${item.contact_person ? item.contact_person : ""}`
      row[1] = `+ ${item.phone_code ? item.phone_code : ""} ${item.contact_number ? item.contact_number : ""}`
      row[2] = item.email_id
      row[3] = obj[item.type_id]
      row[4] = <span className="font-size-16 font-wt-500 text-center mb-0"><img src={'/assets/images/Lc/Dollar.png'} alt='' />{"100"}</span>
      tableData.push(row)
      row = []
    })
    console.log('Tabledataaaaa', tableData)
    return tableData
  }
  const getBranchesData = () => {
    setshowLoader(true)
    call('POST', 'getBranchesData', { userId }).then(result => {
      setgstBranchList(formatDataForGSTTable(result))
      setshowLoader(false)
    }).catch(e => {

    })
  }
  function formatDataForGSTTable(data) {
    let tableData = []
    let row = []
    data.forEach((item, index) => {
      row[0] = item.branchCode
      row[1] = item.gstin
      row[2] = item.address
      tableData.push(row)
      row = []
    })
    return tableData
  }

  function formatDataForTable(data) {
    let tableData = []
    let row = []
    data.forEach((item, index) => {
      const modules = item.UserPermissions ? JSON.parse(item.UserPermissions) : []
      const AccessArr = Object.keys(modules).map(data => data)
      row[0] = item.name_title + " " + item.contact_person
      row[1] = "+ " + item.phone_code + " " + item.contact_number
      row[2] = item.email_id
      row[3] = AccessArr.slice(0, 2).join(',') + (AccessArr.length > 2 ? "+" + (AccessArr.length - 2) + " more" : '')
      row[4] = <label className="text-color1 font-wt-600 m-0 cursor" onClick={() => {
        setSubUserModal(true)
        setviewdetails({
          isVisible: true,
          data: item
        })
      }}>View Details</label>
      tableData.push(row)
      row = []
    })
    return tableData
  }

  const getCountrydata = () => {
    call('GET', 'getallCountry').then((result) => {
      console.log('running getallCountry api-->', result);
      setCountrys(result)
    }).catch((e) => {
      // console.log('error in getBuyersDetail', e);
    });
  }

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
      const profilekycdocs = KYCUploads
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
      const extradetailsreqObj = new FormData()
      for (let i = 0; i <= docsFormArray.length - 1; i++) {
        let compDocs = docsFormArray[i]
        if (data[compDocs.name] === null || data[compDocs.name] === undefined) {
          extradetailsreqObj.append(compDocs.key + compDocs.dbId, null)
        } else {
          if (data[compDocs.name].fromDb === true) {
            //Convert To file Object
            if (data[compDocs.name].filebase64) {
              const filedata = await fetch('data:application/pdf;base64,' + data[compDocs.name].filebase64)
              const blob = await filedata.blob();
              const fileObj = new File([blob], data[compDocs.name].name, { type: blob.type });
              extradetailsreqObj.append(compDocs.key + compDocs.dbId, fileObj)
            }
          } else {
            extradetailsreqObj.append(compDocs.key + compDocs.dbId, data[compDocs.name])
          }
        }
      }
      extradetailsreqObj.append("userId", userId)
      call('POST', 'updateCompanyDocs', extradetailsreqObj).then((result) => {
        setshowLoader(false)
        if (result) {
          setshowLoader(false)
          toastDisplay(result, "success")
        }
      }).catch(err => {
        setshowLoader(false)
        console.log("conn:", err)
        toastDisplay(err, "error");
      })
      getUserProfileData()
    } catch (error) {
      console.log('error in updatedocs', error)
      setshowLoader(false)
    }

  }
  const handleChange = async (event) => {

    if (event.persist) {
      event.persist()
    }

    setData({ ...data, [event.target.name]: event.target.value })
    setErrors({ ...errors, [event.target.name]: "" })


  }
  const handleValidation = () => {
    let error = {}
    if (!data.name_title) {
      error.contactPerson = 'Mandatory Field'
    }
    if (!data.contactPerson) {
      error.contactPerson = 'Mandatory Field'
    }
    if (!data.phone_code) {
      error.phone_code = 'Mandatory Field'
    }
    if (!data.contact_number) {
      error.contact_number = 'Mandatory Field'
    }
    if (!data.user_address) {
      error.user_address = 'Mandatory Field'
    }
    if (!data.companyCity) {
      error.companyCity = 'Mandatory Field'
    }
    if (!data.companyState) {
      error.companyState = 'Mandatory Field'
    }
    if (!data.country_code) {
      error.country_code = 'Mandatory Field'
    }
    if (isEmpty(error)) {
      let reqObj = {
        name_title: data.name_title,
        phone_code: data.phone_code,
        contactPerson: data.contactPerson,
        contact_number: data.contact_number,
        email_id: data.email_id,
        organization_type: data.organization_type,
        industry_type: data.industry_type,
        user_address: data.user_address,
        companyCity: data.companyCity,
        companyState: data.companyState,
        country_code: data.country_code,
        companyPostal: data.companyPostal,
        country_of_incorporation: data.country_of_incorporation,
        country_of_operation: data.country_of_operation,
        years_of_incorporation: data.years_of_incorporation,
        prevNetProfit: data.prevNetProfit,
        ExisExportTurnover: data.ExisExportTurnover,
        ExpecExportTurnover: data.ExpecExportTurnover,
        currency: data.currency,
        tbl_user_id: userId,
      }
      setshowLoader(true)
      call('POST', 'updateUserdata', reqObj).then(result => {
        setshowLoader(false)
        toastDisplay(result, "success")
        getUserDetailsExtra()
        getUserProfileData()
        setEditPopup(false)
      }).catch(e => {
        console.log('error in updateUserdata', e);
        setshowLoader(false)
        toastDisplay(e, "error")
      })
    } else {
      setErrors(error)
    }
  }
  const getHSNListCRM = () => {
    setshowLoader(true)
    let reqObj = {
      EXPORTER_NAME: EXPORTER_NAME,
      EXPORTER_COUNTRY: 'India',
    }
    call('POST', 'getHSNListCRMV2', reqObj).then(result => {
      sethscodesdata(formatDataForhscodesTable(result.message))
      sethscodesCount(result.total_records)
      setshowLoader(false)
    }).catch(e => {
      console.log('error in getBuyerListCRM API');
      setshowLoader(false)
    })
  }
  function formatDataForhscodesTable(data) {
    let tableData = []
    let row = []
    data.forEach((key, index) => {
      row[0] = key.HS_CODE ? key.HS_CODE : 'NA'
      row[1] = key.SUB_CODES ? <span className='cursor' onClick={() => setHSDetails({
        show: true,
        data: data,
        selectedHS: key.HS_CODE
      })}>{key.SUB_CODES}</span> : 0
      row[2] = key.BUYERS ? <span className='cursor' onClick={() => handleBuyersPOPUP(key)}>
        {key.BUYERS}
      </span> : 0
      row[3] = key.TOTAL_SHIPMENTS ? key.TOTAL_SHIPMENTS : 0
      row[4] = (key.FOB != null || key.FOB != undefined) ? `$ ${Intl.NumberFormat("en", { notation: 'compact' }).format(key.FOB)}` || "NA" : 'NA'
      row[5] = key.PRODUCT_DESCRIPTION && key.PRODUCT_DESCRIPTION.length > 60 ? <span title={key.PRODUCT_DESCRIPTION}>{key.PRODUCT_DESCRIPTION.slice(0, 60) + '...'}</span> : key.PRODUCT_DESCRIPTION
      row[6] = <ul className='py-0 pl-3 cursor' onClick={() => handleCountriesPOPUP(key)} >
        {key?.TOP_COUNTRIES?.slice(0, 2)?.map(item => {
          return <li >
            <div>
              {item.DESTINATION_COUNTRY}
            </div>
          </li>
        })}
      </ul>
      tableData.push(row)
      row = []
    })
    return tableData
  }
  async function handleCountriesPOPUP(itemData) {
    setshowLoader(true)
    try {
      let apiResp = await call('POST', 'getTopCountries', {
        EXPORTER_NAME: EXPORTER_NAME
      })
      // console.log("getTransactionHistoryForInvoiceLimit api resp====>", itemData, apiResp);
      setshowLoader(false)
      togglecountriesPopup({ show: true, data: apiResp })
    } catch (e) {
      setshowLoader(false)
    }
  }
  useEffect(() => {
    getHSNListCRM()
  }, [hscodespage])
  async function handleBuyersPOPUP(itemData) {
    setshowLoader(true)
    try {
      let apiResp = await call('POST', 'getTopBuyers', {
        EXPORTER_NAME: EXPORTER_NAME,
        EXPORTER_COUNTRY: 'India',
        HS_CODE: itemData.HS_CODE
      })
      // console.log("getTransactionHistoryForInvoiceLimit api resp====>", itemData, apiResp);
      setshowLoader(false)
      togglebuyersPopup({ show: true, data: apiResp })
    } catch (e) {
      setshowLoader(false)
    }
  }
  useEffect(() => {
    Object.keys(hsExpanded).filter(item => hsExpanded[item]).forEach(hsCode => {
      if (!graphTableMode[`ExpHis_${hsCode}`]) {
        let columndata = [{ name: "Date" }]
        let tabledata = []
        if (tab[hsCode] === 'Values') {
          for (let i = 0; i <= exportchartconfig?.[`config_${hsCode}`]?.length - 1; i++) {
            let element = exportchartconfig?.[`config_${hsCode}`][i]
            columndata.push({
              name: element.dataKey?.split("_")[0]
            })
            if (exportHistory?.[`graph_${hsCode}`] && exportHistory?.[`graph_${hsCode}`]?.length) {
              const item = exportHistory?.[`graph_${hsCode}`][i]
              tabledata.push([item?.label])

            }
          }
          setGraphColumns({
            ...graphColumns,
            [`expHistory_${hsCode}`]: columndata
          })
          let resarray = []
          let totalObj = ["Total"]
          for (let index = 0; index < exportHistory?.[`graph_${hsCode}`]?.length; index++) {
            const element = exportHistory?.[`graph_${hsCode}`][index];
            let tempArray = []
            tempArray.push(getXAxisDateFormat(graphConfiguration?.[`ExportHistoryTo_${hsCode}`], graphConfiguration?.[`ExportHistoryFrom_${hsCode}`], element.label))
            for (let j = 1; j < columndata.length; j++) {
              const item = columndata[j]
              tempArray.push(element[`${item.name}_VALUE`] ? `$ ${Intl.NumberFormat("en", { notation: 'compact' }).format(element[`${item.name}_VALUE`])}` : "$ 0")
              if (element[`${item.name}_VALUE`]) {
                totalObj[j] = totalObj[j] ? totalObj[j] + element[`${item.name}_VALUE`] : element[`${item.name}_VALUE`]
              }
            }
            resarray.push(tempArray)
          }
          resarray.push(totalObj.map((item, index) => index === 0 ? item : `$ ${Intl.NumberFormat("en", { notation: 'compact' }).format(item)}`))
          setexportHistoryTableData({
            ...exportHistoryTableData,
            [hsCode]: resarray
          })
        } else {
          for (let i = 0; i <= quantitychartconfig?.[`quantconfig_${hsCode}`]?.length - 1; i++) {
            let element = quantitychartconfig?.[`quantconfig_${hsCode}`]?.[i]
            columndata.push({
              name: element.dataKey?.split("_")[0]
            })
          }
          setGraphColumns({
            ...graphColumns,
            [`expHistory_${hsCode}`]: columndata
          })
          let resarray = []
          let totalObj = ["Total"]
          for (let index = 0; index < exportHistory?.[`graph_${hsCode}`]?.length; index++) {
            const element = exportHistory?.[`graph_${hsCode}`]?.[index];
            let tempArray = []
            tempArray.push(getXAxisDateFormat(graphConfiguration?.[`ExportHistoryTo_${hsCode}`], graphConfiguration?.[`ExportHistoryFrom_${hsCode}`], element.label))
            for (let j = 1; j < columndata.length; j++) {
              const item = columndata[j]
              tempArray.push(element[`${item.name}_QUANTITY`] ? element[`${item.name}_QUANTITY`] : "-")
              if (element[`${item.name}_QUANTITY`]) {
                totalObj[j] = totalObj[j] ? totalObj[j] + element[`${item.name}_QUANTITY`] : element[`${item.name}_QUANTITY`]

              }
            }
            resarray.push(tempArray)
          }
          resarray.push(totalObj.map((item, index) => index === 0 ? item : item?.toFixed(2)))
          setexportHistoryTableData({
            ...exportHistoryTableData,
            [hsCode]: resarray
          })
        }
      }
    })

  }, [graphTableMode, tab, hsExpanded])
  useEffect(() => {
    Object.keys(hsExpanded).filter(item => hsExpanded[item]).forEach(hsCode => {
      if (!graphTableMode[`priceHis_${hsCode}`]) {
        let columndata = [{ name: "Date" }]
        let tabledata = []
        for (let i = 0; i <= chartconfig?.[`config_${hsCode}`]?.length - 1; i++) {
          let element = chartconfig?.[`config_${hsCode}`]?.[i]
          columndata.push({
            name: element.dataKey
          })
          if (graphdata?.[`graph_${hsCode}`] && graphdata?.[`graph_${hsCode}`]?.length) {
            const item = graphdata?.[`graph_${hsCode}`][i]
            tabledata.push([item?.label])
          }
        }
        setGraphColumns({
          ...graphColumns,
          [`price_his${hsCode}`]: columndata
        })
        let resarray = []
        let totalObj = ["Total"]
        for (let index = 0; index < graphdata?.[`graph_${hsCode}`]?.length; index++) {
          const element = graphdata?.[`graph_${hsCode}`]?.[index];
          let tempArray = []
          tempArray.push(getXAxisDateFormat(graphConfiguration[`priceHistoryTo_${hsCode}`], graphConfiguration[`priceHistoryFrom_${hsCode}`], element.label))
          for (let j = 1; j < columndata.length; j++) {
            const item = columndata[j]
            tempArray.push(element[`${item.name}`] ? `$ ${element[item.name]} ` : '-')
            if (element[`${item.name}`]) {
              totalObj[j] = totalObj[j] ? parseFloat(totalObj[j] + element[`${item.name}`]) : parseFloat(element[`${item.name}`])
            }
          }
          resarray.push(tempArray)
        }
        resarray.push(totalObj.map((item, index) => index === 0 ? item : "$ " + (item / graphdata?.[`graph_${hsCode}`]?.length)?.toFixed(2)))
        setPriceHistoryTableData({
          ...priceHistoryTableData,
          [hsCode]: resarray
        })
      }
    })
  }, [graphTableMode, hsExpanded])
  const handleGraphConfigurationChange = async (event) => {
    if (event.persist) {
      event.persist()
    }
    setGraphConfiguration({ ...graphConfiguration, [event.target.name]: event.target.value })
  }
  const getXAxisDateFormat = (toDate, FromDate, value) => {
    let countForMonths = moment(toDate).diff(FromDate, 'month')
    let dateFormat = ''
    if (countForMonths > 12) {
      dateFormat = value
    }
    if (countForMonths > 3) {
      console.log('dartataaadsasdsdasad', moment(value).format('MMM YYYY'));
      dateFormat = moment(value).format('MMM YYYY')
    } else if (countForMonths === 1) {
      dateFormat = moment(value).format('DD MMM YYYY')
    } else {
      dateFormat = value
    }
    return dateFormat
  }
  const getHSTrendGraph = () => {
    Object.keys(hsExpanded).filter(item => hsExpanded[item]).forEach(element => {
      setshowLoader(true)
      call('POST', 'getHSTrendGraphV2', {
        priceHistoryFrom: graphConfiguration[`priceHistoryFrom_${element}`], priceHistoryTo: graphConfiguration[`priceHistoryTo_${element}`], EXPORTER_NAME: EXPORTER_NAME, EXPORTER_COUNTRY: 'India', selectedHS: element
      }).then(result => {
        setgraphdata({
          ...graphdataRef.current,
          [`graph_${element}`]: result.message
        })
        graphdataRef.current = {
          ...graphdataRef.current,
          [`graph_${element}`]: result.message
        }
        setChartConfig({
          ...chartconfigRef.current,
          [`config_${element}`]: result.chartconfig
        })
        chartconfigRef.current = {
          ...chartconfigRef.current,
          [`config_${element}`]: result.chartconfig
        }
        setshowLoader(false)
      }).catch(e => {
        setshowLoader(false)
        console.log('error in HS', e);
      })
    })

  }
  const getHSExportTrendGraph = () => {
    Object.keys(hsExpanded).filter(item => hsExpanded[item]).forEach(element => {
      call('POST', 'getHSExportTrendGraphV2', {
        priceHistoryFrom: graphConfiguration[`ExportHistoryFrom_${element}`], priceHistoryTo: graphConfiguration[`ExportHistoryTo_${element}`], EXPORTER_NAME: EXPORTER_NAME, EXPORTER_COUNTRY: 'India', selectedHS: HSDetails.selectedHS
      }).then(result => {
        setexportHistory({
          ...exportHistoryRef.current,
          [`graph_${element}`]: result.message
        })
        exportHistoryRef.current = {
          ...exportHistoryRef.current,
          [`graph_${element}`]: result.message
        }
        setexportchartconfig({
          ...exportchartconfigRef.current,
          [`config_${element}`]: result.chartconfig
        })
        exportchartconfigRef.current = {
          ...exportchartconfigRef.current,
          [`config_${element}`]: result.chartconfig
        }
        setquantitychartconfig({
          ...quantitychartconfigRef.current,
          [`quantconfig_${element}`]: result.quantitychartconfig
        })
        exportchartconfigRef.current = {
          ...quantitychartconfigRef.current,
          [`quantconfig_${element}`]: result.quantitychartconfig
        }
      }).catch(e => {
        console.log('error in HS', e);
      })
    })
  }
  useEffect(() => {
    setHSExpanded({
      [HSDetails.selectedHS]: true
    })
    let graphConfigurationObj = {}
    let countriesFilterObj = {}
    let lanesFilterObj = {}
    let shipmentsFromFilterObj = {}
    let shipmentsToFilterObj = {}
    let hstableObj = {}
    let tabObj = {}
    HSDetails.data.forEach(item => {
      graphConfigurationObj[`ExportHistoryTo_${item.HS_CODE}`] = todayDateObj.clone().format("YYYY-MM-DD")
      graphConfigurationObj[`ExportHistoryFrom_${item.HS_CODE}`] = lastMonthDateObj.clone().format("YYYY-MM-DD")
      graphConfigurationObj[`priceHistoryFrom_${item.HS_CODE}`] = lastMonthDateObj.clone().format("YYYY-MM-DD")
      graphConfigurationObj[`priceHistoryTo_${item.HS_CODE}`] = todayDateObj.clone().format("YYYY-MM-DD")

      countriesFilterObj[item.HS_CODE] = '2022-2023'
      lanesFilterObj[item.HS_CODE] = '2022-2023'
      shipmentsFromFilterObj[item.HS_CODE] = '2022-2023'
      shipmentsToFilterObj[item.HS_CODE] = '2022-2023'
      hstableObj[`ExpHis_${item.HS_CODE}`] = true
      hstableObj[`priceHis_${item.HS_CODE}`] = true
      tabObj[item.HS_CODE] = 'Values'
    })
    setGraphConfiguration(graphConfigurationObj)
    setCountriesFilter(countriesFilterObj)
    setLanesFilter(lanesFilterObj)
    setShipmentsFromFilter(shipmentsFromFilterObj)
    setShipmentsToFilter(shipmentsToFilterObj)
    setGraphTableMode(hstableObj)
    setTab(tabObj)

  }, [HSDetails.selectedHS])
  useEffect(() => {
    if (graphConfiguration) {
      getHSTrendGraph()
      getHSExportTrendGraph()
    }
  }, [graphConfiguration, hsExpanded])

  const getshipmentcountrychart = () => {
    Object.keys(hsExpanded).filter(item => hsExpanded[item]).forEach(element => {
      const dateRange = getFiscalYearDates(countriesFilter[element]?.split('-')?.[0])
      call('POST', 'getshipmentcountriesV2', {
        dateFrom: dateRange.startDate, dateTo: dateRange.endDate, EXPORTER_NAME: EXPORTER_NAME, EXPORTER_COUNTRY: 'India', selectedHS: element
      }).then(result => {
        setCountriesChart({
          ...countriesChartRef.current,
          [`countries_${element}`]: result
        })
        countriesChartRef.current = {
          ...countriesChartRef.current,
          [`countries_${element}`]: result
        }
      }).catch(e => {
        console.log('error in HS', e);
      })
    })
  }
  const getSourceDestinationCount = () => {
    Object.keys(hsExpanded).filter(item => hsExpanded[item]).forEach(element => {
      const dateRange = getFiscalYearDates(lanesFilter[element]?.split('-')?.[0])

      call('POST', 'getSourceDestinationCountV2', {
        dateFrom: dateRange.startDate, dateTo: dateRange.endDate, EXPORTER_NAME: EXPORTER_NAME, EXPORTER_COUNTRY: 'India', selectedHS: element
      }).then(result => {
        setlanesChart({
          ...lanesChartRef.current,
          [`lanes_${element}`]: result
        })
        lanesChartRef.current = {
          ...lanesChartRef.current,
          [`lanes_${element}`]: result
        }
      }).catch(e => {
        console.log('error in HS', e);
      })
    })
  }
  const getshipmentsoriginportchart = () => {
    Object.keys(hsExpanded).filter(item => hsExpanded[item]).forEach(element => {
      const dateRange = getFiscalYearDates(shipmentsFromFilter[element]?.split('-')?.[0])

      call('POST', 'gettoporiginportsV2', {
        dateFrom: dateRange.startDate, dateTo: dateRange.endDate, EXPORTER_NAME: EXPORTER_NAME, EXPORTER_COUNTRY: 'India', selectedHS: element
      }).then(result => {
        setshipmentsFromChart({
          ...shipmentsFromChartRef.current,
          [`source_port_${element}`]: result
        })
        shipmentsFromChartRef.current = {
          ...shipmentsFromChartRef.current,
          [`source_port_${element}`]: result
        }
      }).catch(e => {
        console.log('error in HS', e);
      })
    })
  }
  const getshipmentsportchart = () => {
    Object.keys(hsExpanded).filter(item => hsExpanded[item]).forEach(element => {
      const dateRange = getFiscalYearDates(shipmentsToFilter[element]?.split('-')?.[0])

      call('POST', 'gettopportsshipmentsV2', {
        dateFrom: dateRange.startDate, dateTo: dateRange.endDate, EXPORTER_NAME: EXPORTER_NAME, EXPORTER_COUNTRY: 'India', selectedHS: element
      }).then(result => {
        setshipmentsToChart({
          ...shipmentsToChartRef.current,
          [`destination_port_${element}`]: result
        })
        shipmentsToChartRef.current = {
          ...shipmentsToChartRef.current,
          [`destination_port_${element}`]: result
        }
      }).catch(e => {
        console.log('error in HS', e);
      })
    })
  }
  useEffect(() => {
    getshipmentcountrychart()
  }, [hsExpanded, countriesFilter])
  useEffect(() => {
    getSourceDestinationCount()
  }, [hsExpanded, lanesFilter])
  useEffect(() => {
    getshipmentsoriginportchart()
  }, [hsExpanded, shipmentsFromFilter])
  useEffect(() => {
    getshipmentsportchart()
  }, [hsExpanded, shipmentsToFilter])
  return (
    <>
      {showLoader && (<div className="loading-overlay"><span><img className="" src="assets/images/loader.gif" alt="description" /></span></div>)}
      <ToastContainer position="bottom-right" autoClose={5000} hideProgressBar={false} newestOnTop closeOnClick rtl={false} pauseOnVisibilityChange draggable pauseOnHover />
      {subUserModal &&
        <SubUserModal setSubUserModal={setSubUserModal} subUserModal={subUserModal} countrys={countrys} userTokenDetails={{
          user_id: userTokenDetails.id,
          type_id: userTokenDetails.type_id,
          userName: userTokenDetails.company_name
        }} isEditable={viewdetails.isVisible} formdata={viewdetails.data} />
      }
      <div className={`modal fade ${buyersPopup.show && "show"}`} style={buyersPopup.show ? { display: "block", "zIndex": '100001' } : {}}>
        <div className="modal-dialog modal-md mr-0 my-0">
          <div className="modal-content submitmodal pb-4"
          >

            <div className="modal-header border-0">
              <div className="w-100 d-flex align-items-center justify-content-between">
                <label
                  className="font-size-16 font-wt-600 text-color-value mx-3"
                >Top Buyers BY FOB</label>
                <div className="modal-header border-0">
                  <button type="button" className="btn-close" aria-label="Close" onClick={() => togglebuyersPopup({ show: false, data: [] })}></button>
                </div>
              </div>
            </div>

            <div className="modal-body px-4">
              {buyersPopup.data.length ? buyersPopup.data.map((item, index) => {
                return (
                  <div className='d-flex flex-row ml-3'>
                    <div className="progressBarContainer2">
                      <div className="progressBarInnerCircle">
                      </div>
                    </div>
                    <div className='pl-4 pt-4 mt-2'>
                      <p className='font-size-14 text-color1 font-wt-500 mb-0'>
                        {item.CONSGINEE_NAME ? item.CONSGINEE_NAME : 'NA'}
                        {/* <span className='font-size-14 text-color-label font-wt-500 mb-0'>{` ${item.total_shipments} `}</span> */}
                        <span className='font-size-14 text-color-label font-wt-700 mb-0'>{` ${item.FOB ? "$ " + Intl.NumberFormat("en", { notation: 'compact' }).format(item.FOB) : '$ 0'} `}</span>

                      </p>
                    </div>
                  </div>
                )
              }) :
                null}
            </div>

          </div>
        </div>
      </div>
      <div className={`modal fade ${countriesPopup.show && "show"}`} style={countriesPopup.show ? { display: "block", "zIndex": '100001' } : {}}>
        <div className="modal-dialog modal-md mr-0 my-0">
          <div className="modal-content submitmodal pb-4"
          >

            <div className="modal-header border-0">
              <div className="w-100 d-flex align-items-center justify-content-between">
                <label
                  className="font-size-16 font-wt-600 text-color-value mx-3"
                >Top Countries BY FOB</label>
                <div className="modal-header border-0">
                  <button type="button" className="btn-close" aria-label="Close" onClick={() => togglecountriesPopup({ show: false, data: [] })}></button>
                </div>
              </div>
            </div>

            <div className="modal-body px-4">
              {countriesPopup.data.length ? countriesPopup.data.map((item, index) => {
                return (
                  <div className='d-flex flex-row ml-3'>
                    <div className="progressBarContainer2">
                      <div className="progressBarInnerCircle">
                      </div>
                    </div>
                    <div className='pl-4 pt-4 mt-2'>
                      <p className='font-size-14 text-color1 font-wt-500 mb-0'>
                        {item['_id'] ? item['_id'] : 'NA'}
                        <span className='font-size-14 text-color-label font-wt-500 mb-0'>{` ${item.total_shipments} `}</span>
                        <span><img src='assets/images/arrow.png' className='cursor' onClick={() => handleAccordianClick(index)} /></span>
                      </p>
                      {activeIndex === index &&
                        <div>
                          <p className='mb-0 font-size-14'>Buyers</p>
                          <ol type="1" className='py-0 pl-3 cursor' onClick={() => handleCountriesPOPUP(item)} style={{ listStyle: 'decimal' }}>
                            {item?.top_buyers?.map(item => {
                              return <li >
                                <div className='font-size-14'>
                                  {item.buyer_name + " - " + item.shipment_count}
                                </div>
                              </li>
                            })}
                          </ol>
                        </div>
                      }
                    </div>
                  </div>
                )
              }) :
                null}
            </div>

          </div>
        </div>
      </div>
      <div className={`modal fade ${addmoreContacts && "show"}`} style={addmoreContacts ? { display: "block", "zIndex": '1000001' } : {}}>
        <div className="modal-dialog modal-md  modal-dialog-centered">
          <div className="modal-content submitmodal pb-4"
          >
            <div className="modal-header border-0">
              <div className="w-100 d-flex align-items-center justify-content-between">
                <div className='d-flex gap-3 align-items-center'>
                  <label
                    className="font-size-14 font-wt-500 text-color-value mx-3 mb-0"
                  >{`Add New Contact`}</label>
                  <img src='assets/images/delete.png' />
                </div>

                <div className="modal-header border-0">
                  <img src='assets/images/close-schedule.png' className='cursor' onClick={() => {
                    setAddMoreContacts(false)
                    setData({
                      ...data,
                      contactNo: "",
                      contact_person: "",
                      department: "",
                      designation: "",
                      email_id: ""
                    })
                    setIsEditContact({
                      isEdit: false,
                      _id: ''
                    })
                  }} />
                </div>
              </div>
            </div>
            <div className="modal-body px-4">
              <div className='col-md-12 d-flex align-items-center flex-column'>
                <div className="col-md-10 pt-1 ">
                  <div className="col-md-11 px-0">
                    <NewInput
                      isAstrix={true}
                      type={"text"}
                      label={"Contact Person Name"}
                      name={"contact_person"}
                      value={data.contact_person}
                      onChange={handleChange}
                      error={errors.contact_person}
                    />
                  </div>
                </div>
                <div className="col-md-10 pt-1 ">
                  <div className="col-md-11 px-0">
                    <NewInput
                      isAstrix={true}
                      type={"text"}
                      label={"Designation"}
                      name={"designation"}
                      value={data.designation}
                      onChange={handleChange}
                      error={errors.designation}
                    />
                  </div>
                </div>
                <div className="col-md-10 pt-1 ">
                  <div className="col-md-11 px-0">
                    <NewInput
                      isAstrix={true}
                      type={"text"}
                      label={"Department"}
                      name={"department"}
                      value={data.department}
                      onChange={handleChange}
                      error={errors.department}
                    />
                  </div>
                </div>
                <div className="col-md-10 pt-1 ">
                  <div className="col-md-11 px-0">
                    <InputWithSelect
                      selectData={countrydata} selectName={"phoneCode"} selectValue={data.phoneCode} optionLabel={"phonecode"}
                      optionValue={'phonecode'}
                      type="number" name={"contactNo"} value={data["contactNo"]}
                      onChange={handleChange}
                      label={"Conatct No."} error={errors["contactNo"]} />
                  </div>
                </div>
                <div className="col-md-10 pt-1 ">
                  <div className="col-md-11 px-0">
                    <NewInput
                      isAstrix={true}
                      type={"text"}
                      label={"Email ID"}
                      name={"email_id"}
                      value={data.email_id}
                      onChange={handleChange}
                      error={errors.email_id}
                    />
                  </div>
                </div>
                <div className='col-md-10 mt-2 '>
                  <img
                    onClick={() => setData({ ...data, primaryDetails: !data.primaryDetails })}
                    className='cursor mr-3' src={`assets/images/${data.primaryDetails ? 'checked-green' : 'empty-check'}.png`} />
                  <label>Select as primary contact</label>
                </div>
                <div className='col-md-10 pt-1 '>
                  <button onClick={addExtraContactDetails} className={`mt-3 new-btn  py-2 px-2 text-white cursor`}>Save Contact</button>
                </div>

              </div>

            </div>
          </div>
        </div>
      </div>
      {editPopup &&
        <div className={`modal fade ${editPopup && "show"}`} style={{ display: "block", "zIndex": '100001' }}>
          <div className="modal-dialog modal-md mr-0 my-0" ref={modalRef}>
            <div className="modal-content submitmodal pb-4">
              <div className="modal-header border-0">
                <div className="w-100 d-flex align-items-center justify-content-between">
                  <label
                    className="font-size-16 font-wt-600 text-color-value mx-3"
                  >Edit user details</label>
                  <div className="modal-header border-0">
                    <button type="button" className="btn-close" aria-label="Close" onClick={() => setEditPopup(false)}></button>
                  </div>
                </div>
              </div>

              <div className="modal-body px-4 filterbody">

                <div className="col py-2 ">
                  <div className="col-md-12 px-0">
                    <InputWithSelect isAstrix={true} type={"text"} label={"Contact Person"}
                      selectData={[{ name: "Mr" }, { name: 'Miss' }]}
                      selectName={"name_title"} selectValue={data.name_title}
                      optionLabel={"name"} optionValue={'name'}
                      name={'contactPerson'} value={data.contactPerson} error={errors.contactPerson}
                      onChange={handleChange} />
                  </div>
                </div>

                <div className="col py-2 ">
                  <div className="col-md-12 px-0">
                    {/* <label>Contact Number</label> */}
                    <InputWithSelect isAstrix={true} type={"text"} label={"Contact Number"}
                      selectData={countrys}
                      selectName={"phone_code"} selectValue={data.phone_code}
                      optionLabel={"phonecode"} optionValue={'phonecode'}
                      name={'contact_number'} value={data.contact_number} error={errors.contact_number}
                      onChange={handleChange} />
                  </div>
                </div>

                <div className="col py-2">
                  <div className="col-md-12 px-0">
                    <NewInput isAstrix={true} type={"text"} label={"Email ID"}
                      name={"email_id"} value={data.email_id} error={errors.email_id}
                      onChange={handleChange} />
                  </div>
                </div>

                <div className="col py-2">
                  <div className="col-md-12 px-0">
                    <NewSelect
                      selectData={companyTypes}
                      optionLabel={'name'}
                      optionValue={'alt'}
                      name={"organization_type"}
                      label={'Organization Type'}
                      value={data.organization_type || ""}
                      onChange={handleChange}
                      error={errors.organization_type} />
                  </div>
                </div>

                <div className="col py-2">
                  <div className="col-md-12 px-0">
                    <NewSelect
                      selectData={industryData}
                      optionLabel={'name'}
                      optionValue={'value'}
                      name={"industry_type"}
                      label={'Industry Type'}
                      value={data.industry_type || ""}
                      onChange={handleChange}
                      error={errors.industry_type} />
                  </div>
                </div>

                <div className="col py-2">
                  <div className="col-md-12 px-0">
                    <NewInput isAstrix={true} type={"text"} label={"Address"}
                      name={"user_address"} value={data.user_address} error={errors.user_address}
                      onChange={handleChange} />
                  </div>
                </div>

                <div className="col py-2">
                  <div className="col-md-12 px-0">
                    <NewInput isAstrix={true} type={"text"} label={"Company City"}
                      name={"companyCity"} value={data.companyCity} error={errors.companyCity}
                      onChange={handleChange} />
                  </div>
                </div>

                <div className="col py-2">
                  <div className="col-md-12 px-0">
                    <NewInput isAstrix={true} type={"text"} label={"Company State"}
                      name={"companyState"} value={data.companyState} error={errors.companyState}
                      onChange={handleChange} />
                  </div>
                </div>

                <div className="col py-2">
                  <div className="col-md-12 px-0">
                    <NewSelect
                      selectData={countrys}
                      optionLabel={'name'}
                      optionValue={'sortname'}
                      name={"country_code"}
                      label={'Country'}
                      value={data.country_code || ""}
                      onChange={handleChange}
                      error={errors.country_code} />
                  </div>
                </div>

                <div className="col py-2">
                  <div className="col-md-12 px-0">
                    <NewInput type={"text"} label={"Postal Code"}
                      name={"companyPostal"} value={data.companyPostal} error={errors.companyPostal}
                      onChange={handleChange} />
                  </div>
                </div>

                <div className="col py-2 ">
                  <div className="col-md-12 px-0">
                    <NewSelect label={"Country of incorporation"}
                      selectData={countrys} name={"country_of_incorporation"}
                      value={data.country_of_incorporation} optionLabel={"name"} optionValue={'sortname'}
                      onChange={handleChange} error={errors.country_of_incorporation} />
                  </div>
                </div>
                <div className="col py-2 ">
                  <div className="col-md-12 px-0">
                    <NewSelect label={"Country of operation"}
                      selectData={countrys} name={"country_of_operation"}
                      value={data.country_of_operation} optionLabel={"name"} optionValue={'sortname'}
                      onChange={handleChange} error={errors.country_of_operation} />
                  </div>
                </div>
                <div className="col py-2 ">
                  <div className="col-md-12 px-0">
                    <NewInput type={"text"} label={"Years of incorporation"}
                      name={"years_of_incorporation"} value={data.years_of_incorporation} error={errors.years_of_incorporation}
                      onChange={handleChange} />
                  </div>
                </div>
                <div className="col py-2 ">
                  <div className="col-md-12 px-0">
                    <InputWithSelect type={"text"} label={"Last year’s net profit"}
                      selectData={most_used_currencies}
                      selectName={"currency"} selectValue={data.currency}
                      optionLabel={"code"} optionValue={'code'}
                      name={'prevNetProfit'} value={data.prevNetProfit} error={errors.prevNetProfit}
                      onChange={handleChange} />
                  </div>
                </div>
                <div className="col py-2 ">
                  <div className="col-md-12 px-0">
                    <InputWithSelect type={"text"} label={"Average existing turnover"}
                      selectData={most_used_currencies}
                      selectName={"currency"} selectValue={data.currency}
                      optionLabel={"code"} optionValue={'code'}
                      name={'ExisExportTurnover'} value={data.ExisExportTurnover} error={errors.ExisExportTurnover}
                      onChange={handleChange} />
                  </div>
                </div>
                <div className="col py-2 ">
                  <div className="col-md-12 px-0">
                    <InputWithSelect type={"text"} label={"Expected turnover"}
                      selectData={most_used_currencies}
                      selectName={"currency"} selectValue={data.currency}
                      optionLabel={"code"} optionValue={'code'}
                      name={'ExpecExportTurnover'} value={data.ExpecExportTurnover} error={errors.ExpecExportTurnover}
                      onChange={handleChange} />
                  </div>
                </div>
                <div className="d-flex gap-4  px-3 ">
                  <button className={`mt-4 new-btn w-40 py-2 px-2 text-white cursor`} onClick={handleValidation}>Update</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      }
      <div className='card border-0 chatlist p-4 mt-4'>
        <div className='row'>

          <div className='col-md-4'>
            <div className="">
              {reviewForm.map((item) => {
                let val = userTokenDetails?.subUserProfileDetails?.[item.val] || data?.[item.val] || ""
                let unit = item.unit ? (userTokenDetails?.subUserProfileDetails?.[item.unit] || data[item.unit]) : ""
                return (
                  <div className="col ">
                    <p className="d-flex align-items-top mb-2"><span className="col-md-5 px-0 BuyerdetailsLabel">{item.name}</span><span className="mx-3">:</span><span className="col-md-7 BuyerdetailsDesc" > {
                      item.isMultipleKeys ? item.val.map(item => data[item]).join(",")
                        : val ? (unit ? `${unit ? unit : ''} ` : "") + (val) : "NA"}</span> </p>
                  </div>
                );
              })}
              <div className="col ">
                <p className="d-flex align-items-top mb-2">
                  <span className="col-md-5 px-0 BuyerdetailsLabel">{"Onboarding Date"}</span>
                  <span className="mx-3">:</span>
                  <span className="col-md-7 BuyerdetailsDesc">{userTokenDetails?.created_at ? moment(userTokenDetails?.created_at).format("DD-MM-YYYY") : "-"}</span>
                </p>
              </div>
            </div>
          </div>
          <div className='col-md-4'>
            <div className="">
              {reviewForm2.map((item) => {
                return (
                  <div className="col ">
                    <p className="d-flex align-items-top mb-2"><span className="col-md-5 px-0 BuyerdetailsLabel">{item.name}</span><span className="mx-3">:</span><span className="col-md-7 BuyerdetailsDesc" > {
                      item.isMultipleKeys ? item.val.map(item => data[item]).join(",")
                        : data[item.val] ? (item.unit ? `${data[item.unit]} ` : "") + (data[item.val]) : (item?.calculate ? item.calculate() : "NA")}</span> </p>
                  </div>
                );
              })}
            </div>
          </div>
          <div className='col-md-4'>
            <div className="">
              {reviewForm3.map((item) => {
                return (
                  <div className="col ">
                    <p className="d-flex align-items-top mb-2"><span className="col-md-5 px-0 BuyerdetailsLabel">{item.name}</span><span className="mx-3">:</span><span className="col-md-7 BuyerdetailsDesc" > {
                      item.isMultipleKeys ? item.val.map(item => data[item]).join(",")
                        : data[item.val] ? (item.unit ? `${data[item.unit] ? data[item.unit] : ""} ` : "") + (data[item.val]) : "NA"}</span> </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>


      <div className="card mt-4  br-1 ">
        <div>
          <div className="border-bottom">
            <div className="d-flex flex-row align-items-center justify-content-between p-4">
              <div className="d-flex gap-3">
                <label className="font-size-14 font-wt-600">
                  Auditor details
                </label>
                <img
                  className="cursor"
                  onClick={() => setIsAuditorExpanded(!isAuditorExpanded)}
                  src="assets/images/arrowdown.png"
                  height={20}
                  width={20}
                  style={isAuditorExpanded ? {} : { rotate: "180deg" }}
                />
              </div>
              {showfetch && (
                <button
                  className={` new-btn w-20 py-2 px-4 text-white cursor`}
                  onClick={handleFetchData}
                >
                  Fetch Details
                </button>
              )}
            </div>
          </div>
          {isAuditorExpanded && (
            <div className="mt-4">
              <div className="col-md-12">
                {data?.AUDITOR_DATA &&
                  data?.AUDITOR_DATA.map((element, index) => {
                    return auditorForm.map((item) => {
                      let val = element[item.val] || "NA";
                      let unit = "";
                      return (
                        <div className="col-md-4 ">
                          <p className="d-flex align-items-top mb-2">
                            <span className="col-md-5 px-0 BuyerdetailsLabel">
                              {item.name}
                            </span>
                            <span className="mx-3">:</span>
                            <span className="col-md-7 BuyerdetailsDesc">
                              {(unit ? `${unit ? unit : ""} ` : "") + val}
                            </span>
                          </p>
                        </div>
                      );
                    });
                  })}
              </div>
            </div>
          )}
          {Array.isArray(getdetails) &&
            getdetails.map((ele, index) => (
              <>

                <div className="col-md-12">
                  <div className="row pt-2">
                    <div className="form-group col-md-12">
                      <div className="modal-padding">
                        <ul className="price-ul">
                          <li>
                            <div className="price-left"> {ele.data.auditorProfile[0].addressOfAuditors}</div>
                            <div className="price-right">Auditor Address </div>
                          </li>
                          <li>
                            <div className="price-left"> {ele.data.auditorProfile[0].categryAudtrfrm}</div>
                            <div className="price-right">Auditor Firm</div>
                          </li>
                          <li>
                            <div className="price-left">  {ele.data.auditorProfile[0].itPan}</div>
                            <div className="price-right">It Pan </div>
                          </li>
                          <li>
                            <div className="price-left">  {ele.data.auditorProfile[0].membrshpNum}</div>
                            <div className="price-right">MemberShip Number</div>
                          </li>
                          <li>
                            <div className="price-left"> {ele.data.auditorProfile[0].nameOfAuditor}</div>
                            <div className="price-right">Auditor Name </div>
                          </li>
                          <li>
                            <div className="price-left">{ele.data.auditorProfile[0]
                              .nameOfAuditorSigningReport} </div>
                            <div className="price-right">Name of Auditor Signing Report</div>
                          </li>
                          <li>
                            <div className="price-left"> {ele.data.auditorProfile[0].regstrnNum}</div>
                            <div className="price-right">Registration Number </div>
                          </li>
                          <li>
                            <div className="price-left">{ele.data.auditorProfile[0].srnOfFormADT1} </div>
                            <div className="price-right">Srn number of Form</div>
                          </li>
                          <li>
                            <div className="price-left">  {ele.data.financialEndDate}
                            </div>
                            <div className="price-right">Financial End Date  </div>
                          </li>
                          <li>
                            <div className="price-left">{ele.data.financialStartDate} </div>
                            <div className="price-right">Financial Start Date</div>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ))}
        </div>
      </div>

      <div className='card border-0 chatlist p-4 mt-4'>
        <div className='d-flex row align-items-center'>
          <p className='w-auto font-size-14 font-wt-600  text-decoration-underline'>Contact Details</p>
          {contactstable?.length ?
            <button
              className={` new-btn w-20 py-2 px-4 text-white cursor ml-auto`}
              onClick={() => {
                ExportExcel(contactstable, 'Contact_details')
              }}
            >
              Download Contacts
            </button> : null}
          {shouldFetchLeadGenData ?
            <button
              className={` new-btn w-20 py-2 px-4 text-white cursor ${contactstable?.length ? ' ml-4 ' : ' ml-auto '} `}
              onClick={() => {
                setshowLoader(true)
                call('POST', 'fetchContactsFromLeadGen', { EXPORTER_NAME }).then(res => {
                  setshowLoader(false)
                  toastDisplay('Data fetched', "success")
                  setRefreshContacts(refreshContacts + 1)
                }).catch(err => {
                  setshowLoader(false)
                  toastDisplay(err, "error")
                })
              }}
            >
              Fetch Lead Gen Contacts
            </button> : null}
        </div>
        <div className='mt-4'>
          <NewTable
            disableAction
            columns={[
              { name: "Name" },
              { name: "Designation" },
              { name: "Contact Number" },
              { name: "Email ID" },
              { name: "DIN" },
              { name: "Action" }
            ]}
            data={contactstable}
          />

        </div>
      </div>


      {/* <div className="card mt-4  br-1 ">
              <div>
                <div className="border-bottom">
                  <div className="d-flex flex-row align-items-center justify-content-between p-4">
                    <div className="d-flex gap-3">
                      <label className="font-size-14 font-wt-600">
                        Auditor details
                      </label>
                      <img
                        className="cursor"
                       
                        src="assets/images/arrowdown.png"
                        height={20}
                        width={20}
                      
                      />
                    </div>
                    {showfetch && (
 <button
 className={` new-btn w-20 py-2 px-4 text-white cursor`}
 onClick={handleFetchData}
>
 Fetch Details
</button>)}
                  </div>
                </div>
               
                {Array.isArray(getdetails) && getdetails.length > 0 ? (
                  getdetails.map((ele, index) => (
                    <>
                      

<div className="col-md-12">
                    <div className="row pt-2">
                      <div className="form-group col-md-12">
                        <div className="modal-padding">
                          <ul className="price-ul">
                            <li>
                              <div className="price-left"> {ele.data.auditorProfile[0].addressOfAuditors}</div>
                              <div className="price-right">Auditor Address </div>
                            </li>
                            <li>
                              <div className="price-left"> {ele.data.auditorProfile[0].categryAudtrfrm}</div>
                              <div className="price-right">Auditor Firm</div>
                            </li>
                            <li>
                              <div className="price-left">  {ele.data.auditorProfile[0].itPan}</div>
                              <div className="price-right">It Pan </div>
                            </li>
                            <li>
                              <div className="price-left">  {ele.data.auditorProfile[0].membrshpNum}</div>
                              <div className="price-right">MemberShip Number</div>
                            </li>
                            <li>
                              <div className="price-left"> {ele.data.auditorProfile[0].nameOfAuditor}</div>
                              <div className="price-right">Auditor Name </div>
                            </li>
                            <li>
                              <div className="price-left">{ ele.data.auditorProfile[0]
                                .nameOfAuditorSigningReport} </div>
                              <div className="price-right">Name of Auditor Signing Report</div>
                            </li>
                            <li>
                              <div className="price-left"> {ele.data.auditorProfile[0].regstrnNum}</div>
                              <div className="price-right">Registration Number </div>
                            </li>
                            <li>
                              <div className="price-left">{ele.data.auditorProfile[0].srnOfFormADT1} </div>
                              <div className="price-right">Srn number of Form</div>
                            </li>
                            <li>
                              <div className="price-left">  {ele.data.financialEndDate}
</div>
                              <div className="price-right">Financial End Date  </div>
                            </li>
                            <li>
                              <div className="price-left">{ele.data.financialStartDate} </div>
                              <div className="price-right">Financial Start Date</div>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                    </>
                  ))):(
                    <div   style={{
                      height: "2.5rem",
                      borderBottom: "1px solid #EEEEEE",
                      left: "45%",
                    }}
                    className="position-relative">
                    <div style={{ zIndex: 10 }} className="position-absolute">
                    <label className="font-size-13 font-wt-600">No Data Found</label>
                  </div>
                  </div>
                  )}
              </div>
            </div> */}


      <div className='card border-0 chatlist p-4 mt-4'>
        <p className='font-size-14 font-wt-600  text-decoration-underline'>HS Code Details</p>
        <div className='mt-4'>

          {HSDetails.show ?
            <div>
              <img src="assets/images/ArrowBackLeft.png" height={20} width={20} className="cursor mx-2" onClick={() => {
                setHSDetails({
                  show: false,
                  data: [],
                  selectedHS: null
                })
              }} />
              {HSDetails.data.map((item, index) => {
                return <div className='card mt-4  br-1 '>
                  <div >
                    <div className='border-bottom'>
                      <div className='d-flex flex-row align-items-center justify-content-between p-4'>
                        <div className='d-flex gap-3'>
                          <label className='font-size-14 font-wt-600'>{`HSN Code - ${item.HS_CODE}`}</label>
                          <img className='cursor' onClick={() => setHSExpanded({
                            ...hsExpanded,
                            [item.HS_CODE]: !hsExpanded[item.HS_CODE]
                          })} src='assets/images/arrowdown.png' height={20} width={20} style={(hsExpanded[item.HS_CODE] || item.HS_CODE === HSDetails.selectedHS) ? {} : { rotate: '180deg' }} />
                        </div>
                      </div>
                    </div>
                    {(hsExpanded[item.HS_CODE] || item.HS_CODE === HSDetails.selectedHS) &&
                      <div className='my-4'>
                        <div className='col-md-12'>
                          <div className='p-1 h-100'>
                            <div>
                              <div class="dropdown">
                                <div className='d-flex flex-row align-items-center justify-content-between my-3 ml-3'>
                                  <div className='d-flex align-items-center '>
                                    <label className='text-left font-size-14 font-wt-600 mr-3 mb-0 cursor' onClick={() => { }}>{`Chapter ${item.HS_CODE} Price History`}</label>

                                  </div>

                                  <div className='d-flex flex-row align-items-center gap-2'>
                                    <div className='pr-3'>
                                      <NewInput type={"date"} name={`priceHistoryFrom_${item.HS_CODE}`} value={graphConfiguration[`priceHistoryFrom_${item.HS_CODE}`]}
                                        onChange={handleGraphConfigurationChange} removeMb />
                                    </div>
                                    <div className='pr-3'>
                                      <NewInput type={"date"} name={`priceHistoryTo_${item.HS_CODE}`} value={graphConfiguration[`priceHistoryTo_${item.HS_CODE}`]}
                                        onChange={handleGraphConfigurationChange} removeMb />
                                    </div>
                                    <div className='pr-3'>
                                      <img
                                        onClick={() => { setGraphTableMode({ ...graphTableMode, [`priceHis_${item.HS_CODE}`]: !graphTableMode[`priceHis_${item.HS_CODE}`] }) }}
                                        className='cursor'
                                        src={`/assets/images/${graphTableMode?.[`priceHis_${item.HS_CODE}`] ? 'filterTableMode' : 'filterGraphMode'}.png`} />
                                    </div>
                                    <div className=''>
                                      <img
                                        onClick={() => ExportExcel(priceHistoryTableData[item.HS_CODE] || [], `HS_${item.HS_CODE}_PriceTrend`)}
                                        className='cursor' src='/assets/images/download_icon_with_bg.png' />
                                    </div>
                                  </div>

                                </div>
                              </div>
                            </div>
                            <div className="pt-4">
                              {graphTableMode[`priceHis_${item.HS_CODE}`] ?
                                <CustomLineChart XFormatter={(value) => getXAxisDateFormat(graphConfiguration[`priceHistoryTo_${item.HS_CODE}`], graphConfiguration[`priceHistoryFrom_${item.HS_CODE}`], value)} YFormatter={(value) => "$ " + Intl.NumberFormat('en-US', { notation: 'compact' }).format(value)} bardataConfig={chartconfig[`config_${item.HS_CODE}`]} formatterFunction={(value, name) => ["$ " + Intl.NumberFormat('en-US', { notation: 'compact' }).format(value), name]} data={graphdata[[`graph_${item.HS_CODE}`]]} xDataKey={"label"} isLegend={true} tab={"Values"} type={"Average"} />
                                :
                                <NewTable
                                  disableAction={true}
                                  columns={graphColumns[`price_his${item.HS_CODE}`] || []}
                                  data={priceHistoryTableData[item.HS_CODE] || []}
                                />
                              }
                            </div>
                          </div>
                        </div>
                        <div className='col-md-12'>
                          <div className='p-1 h-100'>
                            <div>
                              <div class="dropdown">
                                <div className='d-flex flex-row align-items-center justify-content-between my-3 ml-3'>
                                  <div className='d-flex align-items-center '>
                                    <label className='text-left font-size-14 font-wt-600 mr-3 mb-0 cursor' onClick={() => { }}>{`Export History`}</label>

                                  </div>

                                  <div className='d-flex flex-row align-items-center gap-2'>
                                    <div >
                                      <ul className="nav pricingtabs nav-pills bg-white mx-auto rounded-pill p-0 shadow-sm" id="pills-tab" role="tablist">
                                        <li className="nav-item p-0 " role="presentation">
                                          <button onClick={() => {
                                            setTab({
                                              ...tab,
                                              [item.HS_CODE]: 'Values'
                                            })
                                          }} className="nav-link active w-100 roundedpillleft font-size-14" id="pills-All-tab" data-bs-toggle="pill" data-bs-target="#pills-All" type="button" role="tab" aria-controls="pills-All" aria-selected="true">Values ($)</button>
                                        </li>
                                        <li className="nav-item p-0 " role="presentation">
                                          <button onClick={() => {
                                            setTab({
                                              ...tab,
                                              [item.HS_CODE]: 'Count'
                                            })
                                          }} className="nav-link w-100 roundedpillright font-size-14 " id="pills-Yearly-tab" data-bs-toggle="pill" data-bs-target="#pills-Yearly" type="button" role="tab" aria-controls="pills-Yearly" aria-selected="false">Avg Quantity</button>
                                        </li>
                                      </ul>
                                    </div>
                                    <div className='pr-3'>
                                      <NewInput type={"date"} name={`ExportHistoryFrom_${item.HS_CODE}`} value={graphConfiguration[`ExportHistoryFrom_${item.HS_CODE}`]}
                                        onChange={handleGraphConfigurationChange} removeMb />
                                    </div>
                                    <div className='pr-3'>
                                      <NewInput type={"date"} name={`ExportHistoryTo_${item.HS_CODE}`} value={graphConfiguration[`ExportHistoryTo_${item.HS_CODE}`]}
                                        onChange={handleGraphConfigurationChange} removeMb />
                                    </div>
                                    <div className='pr-3'>
                                      <img
                                        onClick={() => { setGraphTableMode({ ...graphTableMode, [`ExpHis_${item.HS_CODE}`]: !graphTableMode[`ExpHis_${item.HS_CODE}`] }) }}
                                        className='cursor'
                                        src={`/assets/images/${graphTableMode?.[`ExpHis_${item.HS_CODE}`] ? 'filterTableMode' : 'filterGraphMode'}.png`} />
                                    </div>
                                    <div className=''>
                                      <img
                                        onClick={() => ExportExcel(exportHistoryTableData[item.HS_CODE] || [], `HS_${item.HS_CODE}_ExportTrend`)}
                                        className='cursor' src='/assets/images/download_icon_with_bg.png' />
                                    </div>
                                  </div>

                                </div>
                              </div>
                            </div>
                            <div className="pt-4">
                              {graphTableMode[`ExpHis_${item.HS_CODE}`] ?
                                <CustomLineChart XFormatter={(value) => getXAxisDateFormat(graphConfiguration[`ExportHistoryTo_${item.HS_CODE}`], graphConfiguration[`ExportHistoryFrom_${item.HS_CODE}`], value)} YFormatter={(value) => tab[item.HS_CODE] === 'Values' ? "$ " + Intl.NumberFormat('en-US', { notation: 'compact' }).format(value) : value} bardataConfig={tab[item.HS_CODE] === 'Values' ? exportchartconfig[`config_${item.HS_CODE}`] : quantitychartconfig[`quantconfig_${item.HS_CODE}`]} formatterFunction={(value, name) => [tab[item.HS_CODE] === 'Values' ? "$ " + Intl.NumberFormat('en-US', { notation: 'compact' }).format(value) : value, name?.split('_')[0]]} data={exportHistory[[`graph_${item.HS_CODE}`]]} xDataKey={"label"} isLegend={true} tab={tab[item.HS_CODE]} type={tab[item.HS_CODE] === 'Values' ? "Sum" : 'Average'} />
                                : <NewTable
                                  disableAction={true}
                                  columns={graphColumns[`expHistory_${item.HS_CODE}`] || []}
                                  data={exportHistoryTableData[item.HS_CODE] || []}
                                />
                              }
                            </div>
                          </div>
                        </div>
                        <div className='p-1  border-0  h-100 d-flex flex-row pt-5 pb-4 mx-3' >
                          <div className='col-6'>
                            <div className='d-flex align-items-center justify-content-between'>
                              <label className='font-size-13 font-wt-600 m-0' >Top Export Countries</label>
                              <div className='d-flex flex-row align-items-center pl-4'>
                                <label className='font-size-13 mb-0 font-wt-600 mr-1'>{"Fiscal Year-  "}</label>
                                <label class="text-decoration-underline font-size-15 font-wt-400 m-0" id="dropdownMenuButton1" data-bs-toggle="dropdown" aria-expanded="false">
                                  {countriesFilter[item.HS_CODE] || '-'}
                                  <img src='/assets/images/arrowdown.png' className='ml-2' />

                                </label>
                                <ul class="dropdown-menu dropdownScroller" aria-labelledby="dropdownMenuButton1">
                                  {fiscalyears.map(element => {
                                    return <li className="dropdown-item cursor font-wt-500 " onClick={() => {
                                      setCountriesFilter({
                                        ...countriesFilter,
                                        [item.HS_CODE]: element.label
                                      })
                                    }} >{element.label}</li>
                                  })}
                                </ul>
                              </div>
                              <div className={`d-flex flex-row align-items-center w-auto p-2 m-2`}>
                                <div className='pr-3'>
                                  <img
                                    onClick={() => { }}
                                    className='cursor'
                                    src={`/assets/images/${graphTableMode?.[`ExpHis_${item.HS_CODE}`] ? 'filterTableMode' : 'filterGraphMode'}.png`} />
                                </div>
                                <div className=''>
                                  <img
                                    onClick={() => ExportExcel(countriesChart[`countries_${item.HS_CODE}`] || [], `HS_${item.HS_CODE}_ExportCountries`)}
                                    className='cursor' src='/assets/images/download_icon_with_bg.png' />
                                </div>
                              </div>
                            </div>
                            <div className="d-flex gap-3 h-100">
                              <div className="col-md-6 ">
                                <PieChartComponent data={countriesChart[`countries_${item.HS_CODE}`] || []} dataKey="country_count" label1={""} label2={""} colors={countriesColor} totalCount={gettotalCount(countriesChart[`countries_${item.HS_CODE}`] || [], "country_count")} />
                              </div>
                              <div className="d-flex flex-column justify-content-center col-md-6 mt-3">
                                {countriesChart[`countries_${item.HS_CODE}`]?.map((item, index) => {
                                  return <p className=" letter-spacing05 font-wt-300 font-size-12 mb-4" ><span className="Financelimitapplied me-2" style={{ backgroundColor: countriesColor[index] }}></span>{item.DESTINATION_COUNTRY}</p>
                                })
                                }
                              </div>
                            </div>
                          </div>

                          <div className='col-6'>
                            <div className='d-flex align-items-center justify-content-between'>
                              <label className='font-size-13 font-wt-600 m-0' >Top Lanes Used</label>
                              <div className='d-flex flex-row align-items-center pl-4'>
                                <label className='font-size-13 mb-0 font-wt-600 mr-1'>{"Fiscal Year-  "}</label>
                                <label class="text-decoration-underline font-size-15 font-wt-400 m-0" id="dropdownMenuButton1" data-bs-toggle="dropdown" aria-expanded="false">
                                  {lanesFilter[item.HS_CODE] || '-'}
                                  <img src='/assets/images/arrowdown.png' className='ml-2' />

                                </label>
                                <ul class="dropdown-menu dropdownScroller" aria-labelledby="dropdownMenuButton1">
                                  {fiscalyears.map(element => {
                                    return <li className="dropdown-item cursor font-wt-500 " onClick={() => {
                                      setLanesFilter({
                                        ...lanesFilter,
                                        [item.HS_CODE]: element.label
                                      })
                                    }} >{element.label}</li>
                                  })}
                                </ul>
                              </div>
                              <div className={`d-flex flex-row align-items-center w-auto p-2 m-2`}>
                                <div className='pr-3'>
                                  <img
                                    onClick={() => { }}
                                    className='cursor'
                                    src={`/assets/images/${graphTableMode?.[`ExpHis_${item.HS_CODE}`] ? 'filterTableMode' : 'filterGraphMode'}.png`} />
                                </div>
                                <div className=''>
                                  <img
                                    onClick={() => ExportExcel(lanesChart[`lanes_${item.HS_CODE}`] || [], `HS_${item.HS_CODE}_Lanes`)}
                                    className='cursor' src='/assets/images/download_icon_with_bg.png' />
                                </div>
                              </div>
                            </div>
                            <div className="d-flex gap-3 h-100">
                              <div className="col-md-6">
                                <PieChartComponent data={lanesChart[`lanes_${item.HS_CODE}`] || []} dataKey="port_count" label1={""} label2={""} colors={lanesColor} totalCount={gettotalCount(lanesChart[`lanes_${item.HS_CODE}`] || [], "port_count")} />
                              </div>
                              <div className="d-flex flex-column justify-content-center col-md-6 mt-3">
                                {lanesChart[`lanes_${item.HS_CODE}`]?.map((item, index) => {
                                  return <p className=" letter-spacing05 font-wt-300 font-size-12 mb-4" ><span className="Financelimitapplied me-2" style={{ backgroundColor: lanesColor[index] }}></span>{item.INDIAN_PORT + " > " + item.DESTINATION_PORT}</p>
                                })
                                }
                              </div>
                            </div>

                          </div>
                        </div>
                        <div className='p-1  border-0  h-100 d-flex flex-row pt-5 pb-4 mx-3' >

                          <div className='col-6'>
                            <div className='d-flex align-items-center justify-content-between'>
                              <label className='font-size-13 font-wt-600 m-0' >Top Port Of loading</label>
                              <div className='d-flex flex-row align-items-center pl-4'>
                                <label className='font-size-13 mb-0 font-wt-600 mr-1'>{"Fiscal Year-  "}</label>
                                <label class="text-decoration-underline font-size-15 font-wt-400 m-0" id="dropdownMenuButton1" data-bs-toggle="dropdown" aria-expanded="false">
                                  {shipmentsFromFilter[item.HS_CODE] || '-'}
                                  <img src='/assets/images/arrowdown.png' className='ml-2' />

                                </label>
                                <ul class="dropdown-menu dropdownScroller" aria-labelledby="dropdownMenuButton1">
                                  {fiscalyears.map(element => {
                                    return <li className="dropdown-item cursor font-wt-500 " onClick={() => {
                                      setShipmentsFromFilter({
                                        ...shipmentsFromFilter,
                                        [item.HS_CODE]: element.label
                                      })
                                    }} >{element.label}</li>
                                  })}
                                </ul>
                              </div>
                              <div className={`d-flex flex-row align-items-center w-auto p-2 m-2`}>
                                <div className='pr-3'>
                                  <img
                                    onClick={() => { }}
                                    className='cursor'
                                    src={`/assets/images/${graphTableMode?.[`ExpHis_${item.HS_CODE}`] ? 'filterTableMode' : 'filterGraphMode'}.png`} />
                                </div>
                                <div className=''>
                                  <img
                                    onClick={() => ExportExcel(shipmentsFromChart[`source_port_${item.HS_CODE}`] || [], `HS_${item.HS_CODE}_LoadingPorts`)}
                                    className='cursor' src='/assets/images/download_icon_with_bg.png' />
                                </div>
                              </div>
                            </div>
                            <div className="d-flex gap-3 h-100">
                              <div className="col-md-6">
                                <PieChartComponent data={shipmentsFromChart[`source_port_${item.HS_CODE}`] || []} dataKey={"port_count"} label1={""} label2={""} colors={shipmentsFrom} totalCount={gettotalCount(shipmentsFromChart[`source_port_${item.HS_CODE}`] || [], "port_count")} />

                              </div>
                              <div className="d-flex flex-column justify-content-center col-md-6 mt-3">
                                {shipmentsFromChart[`source_port_${item.HS_CODE}`]?.map((item, index) => {
                                  return <p className=" letter-spacing05 font-wt-300 font-size-12 mb-4" ><span className="Financelimitapplied me-2" style={{ backgroundColor: shipmentsFrom[index] }}></span>{item.INDIAN_PORT}</p>
                                })
                                }
                              </div>
                            </div>
                          </div>

                          <div className='col-6'>
                            <div className='d-flex align-items-center justify-content-between'>
                              <label className='font-size-13 font-wt-600 m-0' >Top Port Of Discharge</label>
                              <div className='d-flex flex-row align-items-center pl-4'>
                                <label className='font-size-13 mb-0 font-wt-600 mr-1'>{"Fiscal Year-  "}</label>
                                <label class="text-decoration-underline font-size-15 font-wt-400 m-0" id="dropdownMenuButton1" data-bs-toggle="dropdown" aria-expanded="false">
                                  {shipmentsToFilter[item.HS_CODE] || '-'}
                                  <img src='/assets/images/arrowdown.png' className='ml-2' />

                                </label>
                                <ul class="dropdown-menu dropdownScroller" aria-labelledby="dropdownMenuButton1">
                                  {fiscalyears.map(element => {
                                    return <li className="dropdown-item cursor font-wt-500 " onClick={() => {
                                      setShipmentsToFilter({
                                        ...shipmentsToFilter,
                                        [item.HS_CODE]: element.label
                                      })
                                    }} >{element.label}</li>
                                  })}
                                </ul>
                              </div>
                              <div className={`d-flex flex-row align-items-center w-auto p-2 m-2`}>
                                <div className='pr-3'>
                                  <img
                                    onClick={() => { }}
                                    className='cursor'
                                    src={`/assets/images/${graphTableMode?.[`ExpHis_${item.HS_CODE}`] ? 'filterTableMode' : 'filterGraphMode'}.png`} />
                                </div>
                                <div className=''>
                                  <img
                                    onClick={() => ExportExcel(shipmentsToChart[`destination_port_${item.HS_CODE}`] || [], `HS_${item.HS_CODE}_DestinationPorts`)}
                                    className='cursor' src='/assets/images/download_icon_with_bg.png' />
                                </div>
                              </div>
                            </div>
                            <div className="d-flex gap-3 h-100">
                              <div className="col-md-6">
                                <PieChartComponent data={shipmentsToChart[`destination_port_${item.HS_CODE}`] || []} dataKey={"port_count"} label1={""} label2={""} colors={shipmentsTo} totalCount={gettotalCount(shipmentsToChart[`destination_port_${item.HS_CODE}`] || [], "port_count")} />
                              </div>
                              <div className="d-flex flex-column justify-content-center col-md-6 mt-3">
                                {shipmentsToChart[`destination_port_${item.HS_CODE}`]?.map((item, index) => {
                                  return <p className=" letter-spacing05 font-wt-300 font-size-12 mb-4" ><span className="Financelimitapplied me-2" style={{ backgroundColor: shipmentsTo[index] }}></span>{item.DESTINATION_PORT}</p>
                                })
                                }
                              </div>
                            </div>
                          </div>
                        </div>

                      </div>
                    }
                  </div>
                </div>

              })}
            </div>

            : <div className="mb-3">
              <NewTable
                tableFixed data={hscodesdata}
                columns={[{
                  name: "HSN Code"
                }, {
                  name: "Sub Codes"
                }, {
                  name: "Buyer"
                }, {
                  name: "Shipment"
                }, {
                  name: "Shipment Value"
                }, {
                  name: "Product Description"
                }, {
                  name: "Top Export Countries"
                }]}
                disableAction={true}
              />

            </div>
          }

        </div>
      </div>
      <div className='card border-0 chatlist p-4 mt-4'>
        <p className='font-size-14 font-wt-600  text-decoration-underline'>Documents</p>
        <div className='row'>
          {BusinessDocs.map(docs => {
            return <div className="col-md-4">
              <label className="font-size-13">{docs.name}</label>
              <div className="row form-group">
                <div className="col-md-11">
                  <FileInput name={docs.name} value={data[docs.name]} error={errors[docs.name]}
                    onChange={handleFile}
                    isEditable={true}
                    userTokenDetails={userTokenDetails}
                    onUploadCancel={() => setData({ ...data, [docs.name]: null })}
                  />
                  {errors[docs.name] ? <div class="text-danger mt-2 font-size-12">
                    <i class="fa fas fa-exclamation-circle mr-1" aria-hidden="true"></i>
                    <b>{errors[docs.name]}</b></div> : ''}
                </div>
              </div>
            </div>
          })
          }
          <div className="col-md-4">
            <label className="font-size-13">{"Commercial Terms"}</label>
            <div className="row form-group">
              <div className="col-md-11">
                <FileInput name={'CommercialTerms'} value={data['CommercialTerms']} error={errors['CommercialTerms']}
                  onChange={handleFile}
                  isEditable={false}
                  userTokenDetails={userTokenDetails}
                />
              </div>
            </div>
          </div>
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
      <div className='card border-0 chatlist p-4 mt-4'>
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
          {/* <Pagination perPage={filter.resultPerPage || 10} page={page} totalCount={count} onPageChange={(p) => setPage(p)} /> */}

        </div>

      </div>
      <div className='card border-0 chatlist p-4 mt-4'>
        <div className='d-flex flex-row justify-content-between align-items-center'>
          <div className='font-size-14 font-wt-600  text-decoration-underline'>Referrals</div>
          <div className='d-flex flex-row gap-2 align-items-center'>
            <label id='referCode' className='font-size-14 mb-0 font-wt-600 text-color1 text-decoration-underline'>{`Code: ${data.referralCode}`}</label>
            <img src={"/assets/images/copy_svg.svg"} alt="" className="ps-2 cursor" onClick={() => copyToClipboard("referCode")} />

          </div>

        </div>
        <div className='mt-4'>
          <NewTable
            disableAction
            columns={[
              { name: "Name", filter: true },
              { name: "Contact no.", filter: true },
              { name: "Email ID", filter: false },
              { name: "Category", filter: false },
              { name: "Rewards", filter: false }
            ]}
            data={referraldata}
          />

        </div>

      </div>
      <div className='card border-0 chatlist p-4 mt-4'>
        <p className='font-size-14 font-wt-600  text-decoration-underline'>Other Branches</p>
        <div className='mt-4'>
          <NewTable
            disableAction
            columns={[
              { name: "Branch Code" },
              { name: "GST IN" },
              { name: "Address" }
            ]}
            data={gstBranchList}
          />

        </div>

      </div>
    </>
  )
}

export default UserDetailsTab