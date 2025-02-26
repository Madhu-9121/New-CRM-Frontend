import React from 'react'
import { useEffect } from 'react'
import { useState } from 'react'
import call from '../../service'
import { FileInput } from '../../utils/FileInput'
import MultipleSelect from '../../utils/MultipleSelect'
import { convertImageToPdf, getDocDetails, getPDFFromFile, isEmpty, most_used_currencies, printDiv } from '../../utils/myFunctions'
import { InputWithSelect, NewInput, NewSelect } from '../../utils/newInput'
import { NewTable } from '../../utils/newTable'
import toastDisplay from '../../utils/toastNotification'
import validateAddBank from '../../utils/validation_files/AddBankValidations'
import validateAddFinance from '../../utils/validation_files/AddFinanceValidations'
import validateAddShareholder from '../../utils/validation_files/AddShareholderValidation'
import Filter from '../InvoiceDiscounting/components/Filter'
import FinanceInvoiceModal from '../InvoiceDiscounting/contract/components/financeinvoiceModal'
import Pagination from '../InvoiceDiscounting/contract/components/pagination'
import { CustomProgressBar } from '../myCounterPartComp/checkBuyerHealth'
import FinanceDetails from '../viewProfile/components/FinanceDetails'
import { ToastContainer } from 'react-toastify'
import NewTablev2 from '../../utils/newTablev2'
import { exportersNavConfig } from '../../utils/myFunctions'
import FeatureTable from './FeatureTable'


const creditreportdata = [
  {
    logo: "/assets/images/logo-dnb 1.png",
    companyname: "D&B",
    alt: "D&B",
    link: 'https://www.dnb.co.in/risk-management-solutions/finance-credit-risk/business-credit-report'
  },
  {
    logo: "/assets/images/equifax_logo.png",
    companyname: "Equifax",
    alt: "Equifax",
    link: "https://www.equifax.com/personal/credit-report-services/free-credit-reports/"
  },
  {
    logo: "/assets/images/Experian_logo.png",
    companyname: "Experian",
    alt: "Experian",
    link: 'https://www.experian.com/consumer-products/free-credit-report.html'
  },
  {
    logo: "/assets/images/transunion-logo.png",
    companyname: "Trans union",
    alt: "Trans Union",
    link: 'https://www.transunion.com/annual-credit-report'
  },
  {
    logo: "/assets/images/logo-spglobal.png",
    companyname: "S&P",
    alt: "S&P Global",
    link: 'https://www.spglobal.com/esg/scores/results'
  },
  {
    logo: "/assets/images/logo_crisil.png",
    companyname: "CRISIL",
    alt: "CRISIL",
    link: 'https://www.crisil.com/en/home/our-businesses/ratings/Credit-Rating-Report.html'
  },
  {
    logo: "/assets/images/logo_icra.png",
    companyname: "ICRA",
    alt: "ICRA",
    link: 'https://www.icra.in/Home/Index'
  },
  {
    logo: "/assets/images/logo_smera.png",
    companyname: "SMERA",
    alt: "SMERA",
    link: 'https://www.smeraonline.com/newweb/index.php/sme-rating/'
  },
  {
    logo: "/assets/images/logo_onicra.jfif",
    companyname: "ONICRA",
    alt: "ONICRA",
    link: 'https://in.linkedin.com/company/onicra-credit-rating-agency-of-india-limited'
  },
  {
    logo: "/assets/images/logo_brickwork.jpg",
    companyname: "BRICKWORK",
    alt: "BRICKWORK",
    link: 'https://www.brickworkratings.com/Home.aspx'
  }
];


const BenfbankDetails = [
  { "name": "Bank Name", val: "beneficiaryBankNameame" },
  { "name": "Branch", val: "beneficiaryBranch" },
  { "name": "Account holder name", val: "beneficiaryAccountName" },
  { "name": "Account No.", val: "beneficiaryAccountNo" },
  { "name": "IFSC Code", val: "beneficiaryIfscCode" },
  { "name": "Swift Code", val: "beneficiarySwiftCode" },
  { "name": "Address", val: "beneficiaryBranchAddress" },
]
const CorrbankDetails = [
  { "name": "Bank Name", val: "correspondentBankName" },
  { "name": "Account No.", val: "correspondentAccountNumber" },
  { "name": "Swift Code", val: "correspondentSwift" },
  { "name": "Email ID", val: "email" },
]

const UserProfileTab = ({ userTokenDetails, adminUserTokenDetails }) => {

  const [data, setData] = useState({})
  const [errors, setErrors] = useState({})

  const [Findata, setFindata] = useState([])
  const [FinfilterData, Finsetfilterdata] = useState([])
  const [Finfilter, FinsetFilter] = useState({ resultPerPage: 10 })
  const [Finrefresh, Finsetrefresh] = useState(0)
  const [FinCount, FinsetCount] = useState(0)
  const [Finpage, Finsetpage] = useState(1)

  const [Bankdata, setBankdata] = useState([])
  const [BankfilterData, Banksetfilterdata] = useState([])
  const [Bankfilter, BanksetFilter] = useState({ resultPerPage: 10 })
  const [Bankrefresh, Banksetrefresh] = useState(0)
  const [BankCount, BanksetCount] = useState(0)
  const [Bankpage, Banksetpage] = useState(1)

  const [SHdata, setSHdata] = useState([])
  const [SHfilterData, SHsetfilterdata] = useState([])
  const [SHfilter, SHsetFilter] = useState({ resultPerPage: 10 })
  const [SHrefresh, SHsetrefresh] = useState(0)
  const [SHCount, SHsetCount] = useState(0)
  const [SHpage, SHsetpage] = useState(1)


  const [ProgressBars, setProgressBars] = useState([])
  const [creditReportData, setCreditReportData] = useState({})
  const [showPopup, togglePopup] = useState(false)
  const [viewDoc, toggleViewDoc] = useState({ show: false, doc: {} })
  const [showLoader, setshowLoader] = useState(false)
  const [financedetails, setFinancedetails] = useState({
    isVisible: false,
    data: {}
  })
  const [addFinanceModal, setAddFinanceModal] = useState(false)
  const [yearlist, setyearList] = useState([])
  const [isSubmitted, setSubmitted] = useState(false)

  const [addBankModal, setAddBankModal] = useState(false)
  const [isBankSubmitted, setBankSubmitted] = useState(false)

  const [countrys, setCountrys] = useState([])
  const [swiftCodedata, setSwifCodeMaster] = useState([])
  const [allSwiftCodeData, setAllSwiftCodeData] = useState([])
  const [states, setstatedata] = useState([])

  const [addSHModal, setAddSHModal] = useState(false)
  const [isSHSubmitted, setSHSubmitted] = useState(false)
  const [cities, setcities] = useState([])
  const [bankdetails, setbankdetails] = useState({ isVisible: false, data: null })
  const [UserServices, setUserServices] = useState([])
  const [exporterData, setexporterData] = useState([])
  const [savedFeatures, setSavedFeatures] = useState([])
  const userTypeId = userTokenDetails.type_id ? userTokenDetails.type_id : null
  const userEmail = userTokenDetails.email_id ? userTokenDetails.email_id : null
  const userId = userTokenDetails.id ? userTokenDetails.id : null
  const userName = userTokenDetails.company_name ? userTokenDetails.company_name : null
  const [selectedPlan, setSelectedPlan] = useState("Container");
  const [planFeatures, setPlanFeatures] = useState({
    Container: {
      Dashboard: true,
      "Network Management": true,
      "Contract Management - Bulk": false,
      "Order Management": true,
      "Letter of Credit": false,
      "Export Factoring": false,
      "Other Financial": false,
      'Trade Discovery': false,
      'Chat Room': true,
      'Document Vault': true,
      EDOCS: true,
      Reports: true,
      Settings: true,
      Insurance: true,
      "Logistics - Container": true,
      "Logistics - Bulk": false,
      "Tally-Accounting": false,
      'Inventory Management': true,
      'Trade GPT': false,
      'HSN Code Finder': true,
      Banking: true,
      Wallet: false,
      'Buyer Discovery': false
    },
    Bulk: {
      Dashboard: true,
      "Network Management": true,
      "Contract Management - Bulk": true,
      "Order Management": false,
      'Letter of Credit': false,
      "Export Factoring": false,
      "Other Financial": false,
      'Trade Discovery': false,
      'Chat Room': true,
      'Document Vault': true,
      EDOCS: true,
      Reports: true,
      Settings: true,
      Insurance: true,
      "Logistics - Container": false,
      "Logistics - Bulk": true,
      "Tally-Accounting": false,
      'Inventory Management': true,
      'Trade GPT': false,
      'HSN Code Finder': false,
      Banking: false,
      Wallet: false,
      'Buyer Discovery': false

    },
    Finance: {
      Dashboard: true,
      "Network Management": true,
      "Contract Management - Bulk": false,
      "Order Management": false,
      "Letter of Credit": true,
      "Export Factoring": true,
      "Other Financial": true,
      'Trade Discovery': false,
      'Chat Room': true,
      'Document Vault': true,
      EDOCS: true,
      Reports: true,
      Settings: true,
      Insurance: false,
      "Logistics - Container": false,
      "Logistics - Bulk": false,
      "Tally-Accounting": false,
      'Inventory Management': false,
      'Trade GPT': true,
      'HSN Code Finder': true,
      Banking: false,
      Wallet: false,
      'Buyer Discovery': false

    }
  });


  const generateFeatures = (category) => {
    const features = [];
    Object.keys(planFeatures[category]).forEach(feature => {
      if (typeof planFeatures[category][feature] === 'object') {
        // If feature is a sub-category (like "Network Management"), loop through its sub-features
        Object.keys(planFeatures[category][feature]).forEach(subFeature => {
          features.push({ category, name: feature + ' - ' + subFeature });
        });
      } else {
        // Simple feature
        features.push({ category, name: feature });
      }
    });
    return features;
  };

  const getCountrydata = () => {
    call('GET', 'getallCountry').then((result) => {
      console.log('running getallCountry api-->', result);
      setCountrys(result)
    }).catch((e) => {
      // console.log('error in getBuyersDetail', e);
    });
  }

  const getSwiftCodes = () => {
    call('POST', 'getSwiftMaster', {}).then(result => {
      console.log('success in getSwiftMaster', result)
      setSwifCodeMaster(result)
      setAllSwiftCodeData(result)
    }).catch(e => {
      console.log('error in getSwiftMaster', e)
    })
  }
  const getStateByCountry = (countryId) => {
    call("POST", "getStateByCountry", { countryId }).then(result => {
      console.log('Success getStateByCountry data', result)
      setstatedata(result)
    }).then(e => {
      console.log("Error in getStateByCountry", e)
    })
  }
  const getCitiesByState = (stateId) => {
    call("POST", "getCitiesByState", { stateId }).then(result => {
      console.log('Success getCitiesByState data', result)
      setcities(result)
    }).catch(e => {
      console.log("Error in getCitiesByState", e)
    })
  }
  const handleChange = (event) => {
    if (event.persist) {
      event.persist()
    }
    if (event.target.name === 'bankCountry') {
      const country = countrys.find(data => data.sortname === event.target.value)
      getStateByCountry(country.id)
    }
    if (event.target.name === 'shareholderCountry') {
      const country = countrys.find(data => data.sortname === event.target.value)
      getStateByCountry(country.id)
    }
    if (event.target.name === 'state') {
      const state = states.find(data => data.name === event.target.value)
      getCitiesByState(state.id)
    }
    setData({ ...data, [event.target.name]: event.target.value })
    setErrors({ ...errors, [event.target.name]: "" })
  }
  const handleFile = event => {
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

      let reader = new FileReader();
      reader.readAsDataURL(event.target.files[0]);
      reader.onloadend = async (e) => {
        let fileObj = event.target.files[0]
        let fileDataUrl = e.target.result
        if (!file_type.includes("pdf")) {
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


  const getfinanceData = () => {
    setshowLoader(true)
    let objectAPI = {
      userTypeId: userTypeId,
      currentPage: 1,
      resultPerPage: Finfilter.resultPerPage,
      search: Finfilter.search,
      manualUserId: userId
    }
    call('POST', 'getuserfinancegrid', objectAPI).then((result) => {
      setFindata(formatDataForTable(result.finData))
      FinsetCount(result.countdata.totalcount);
      setshowLoader(false)
    }).catch((e) => {
      console.log('error in getBuyersDetail', e);
      setshowLoader(false)
    });
  }

  const getUserValues = () => {
    setUserServices(exportersNavConfig)
  }

  useEffect(() => {
    getUserValues()
  }, [])


  const [filteredUserFeatures, setUserFeatures] = useState([])


  const [userPermissions, setUserPermissions] = useState([])
  const [filteruseraccess, setfilteraccess] = useState([])

  // useEffect(() => {
  //   if (adminUserTokenDetails.UserAccessPermission) {
  //     console.log('UserAccessPermission detected:', adminUserTokenDetails.UserAccessPermission);
  //     console.log("hellooooo---->>>>>");
  //     try {
  //       const parsedPermissions = JSON.parse(adminUserTokenDetails.UserAccessPermission);
  //       console.log('Parsed Permissions:', parsedPermissions); // Log the parsed permissions

  //       let items = [];
  //       parsedPermissions.forEach((ele) => {
  //         console.log(ele, "this is ele");
  //         ele.permissions.forEach((newitem) => items.push(newitem.item.toLowerCase().trim()));
  //       });
  //       console.log(items, "hey this is items--....");

  //       const normalizeUrl = (url) => {
  //         // Convert to lowercase, trim whitespace, and remove leading '/'
  //         return url.toLowerCase().trim().replace(/^\/+/, '');
  //       };

  //       const filteredNavConfig = exportersNavConfig.filter(navItem => {
  //         let subItemsRedirectURL
  //         let mainRedirectURL
  //         if (navItem.subItems) {
  //           subItemsRedirectURL = navItem.subItems?.map(subItem => normalizeUrl(subItem.redirectURL));
  //         } else {
  //           mainRedirectURL = normalizeUrl(navItem.redirectURL);
  //         }


  //         console.log(`Checking navItem: ${navItem.text}`);
  //         console.log(`Main redirectURL: ${mainRedirectURL}`);
  //         console.log(`Sub items redirectURLs: ${subItemsRedirectURL}`);

  //         if (items.includes(mainRedirectURL)) {
  //           console.log(`Including main item: ${mainRedirectURL}`);
  //           return true;
  //         }
  //         if (subItemsRedirectURL && subItemsRedirectURL.some(url => items.includes(url))) {
  //           console.log(`Including sub item: ${subItemsRedirectURL}`);
  //           return true;
  //         }
  //         return false;
  //       });

  //       console.log('Filtered Exporters Nav Config:', filteredNavConfig);

  //       // Set user permissions (optional)
  //       setUserPermissions(parsedPermissions);
  //     } catch (error) {
  //       console.error("Failed to parse user permissions:", error);
  //     }
  //   }
  // }, []);

  useEffect(() => {
    if (adminUserTokenDetails.UserAccessPermission !== null) {
      console.log('UserAccessPermission detected:', adminUserTokenDetails.UserAccessPermission);
      console.log("hellooooo---->>>>>");
      try {
        const parsedPermissions = JSON.parse(adminUserTokenDetails.UserAccessPermission);
        console.log('Parsed Permissions:', parsedPermissions); // Log the parsed permissions

        let items = [];
        // parsedPermissions?.forEach((ele) => {
        //   console.log(ele, "this is ele");
        //   ele.permissions.forEach((newitem) => items.push(newitem.item.toLowerCase().trim()));
        // });
        if (Array.isArray(parsedPermissions)) {
          parsedPermissions.forEach((ele) => {
            console.log(ele, "this is ele");
            ele.permissions?.forEach((newitem) => {
              items.push(newitem.item.toLowerCase().trim());
            });
          });
        }
        else if (typeof parsedPermissions === 'object' && parsedPermissions !== null) {
          Object.entries(parsedPermissions).forEach(([key, value]) => {
            console.log(`${key}: ${value}`, "this is key-value pair");
            // If `value` has a `permissions` array, process it
            value?.permissions?.forEach((newitem) => {
              items.push(newitem.item.toLowerCase().trim());
            });
          });
        } else {
          console.warn("Unexpected structure of parsedPermissions");
        }
        console.log(items, "hey this is items--....");

        const normalizeUrl = (url) => {
          if (!url) return '';
          // Convert to lowercase, trim whitespace, and remove leading '/'
          return url.toLowerCase().trim().replace(/^\/+/, '');
        };

        const filteredNavConfig = exportersNavConfig.filter(navItem => {
          const mainRedirectURL = normalizeUrl(navItem.redirectURL);
          const subItemsRedirectURL = navItem.subItems ? navItem.subItems.map(subItem => normalizeUrl(subItem.redirectURL)) : [];

          console.log(`Checking navItem: ${navItem.text}`);
          console.log(`Main redirectURL: ${mainRedirectURL}`);
          console.log(`Sub items redirectURLs: ${subItemsRedirectURL}`);

          if (mainRedirectURL && items.includes(mainRedirectURL)) {
            console.log(`Including main item: ${mainRedirectURL}`);
            return true;
          }
          if (subItemsRedirectURL.some(url => items.includes(url))) {
            console.log(`Including sub item: ${subItemsRedirectURL}`);
            return true;
          }
          return false;
        });

        console.log('Filtered Exporters Nav Config:', filteredNavConfig);
        setfilteraccess(filteredNavConfig)
        // Set user permissions (optional)
        setUserPermissions(parsedPermissions);
      } catch (error) {
        console.error("Failed to parse user permissions:", error);
      }
    }
  }, []);



  useEffect(() => {
    console.log(userTokenDetails, "this is token dets ---???", adminUserTokenDetails)
  }, [])



  function formatDataForTable(data) {
    let tableData = []
    let row = []
    data.forEach((item, index) => {
      row[0] = item.year
      row[1] = item.currency + " " + item.turnover
      row[2] = item.currency + " " + item.netprofit
      row[3] = item.currency + " " + item.networth
      row[4] = <p className='mb-0 text-color1 font-wt-600 cursor' onClick={async () => {
        setshowLoader(true)
        setFinancedetails({
          isVisible: true,
          data: {
            ...item,
            auditDoc: await getDocDetails(item.finance_doc_current_year),
            GSTDoc: await getDocDetails(item.gst_doc_6_month),
            ITRDoc: await getDocDetails(item.itr_doc_1_year),
            DebDoc: await getDocDetails(item.debtor_doc),
            CredDoc: await getDocDetails(item.creditors_doc)
          }
        })
        setshowLoader(false)
      }}>View documents</p>
      tableData.push(row)
      row = []
    })
    return tableData
  }

  const getUserBankList = () => {
    let objectAPI = {
      email: userTokenDetails?.subUserProfileDetails?.parent_email_id || userEmail,
      inProfile: true,
      search: Bankfilter.search,
      resultPerPage: Bankfilter.resultPerPage,
      currentPage: Bankpage
    }
    call('POST', 'getUserBanks', objectAPI).then((result) => {
      console.log('running getUserBanks api-->', result);
      setBankdata(formatDataForBankTable(result.message))
      BanksetCount(result.countData)
    }).catch((e) => {
      console.log('error in getBuyersDetail', e);
    });
  }





  function formatDataForBankTable(data) {
    let tableData = []
    let row = []
    data.forEach((item, index) => {
      const docArray = item.bankDocs ? item.bankDocs.split(',') : []
      row[0] = item.beneficiaryAccountName
      row[1] = item.beneficiaryAccountNo
      row[2] = item.beneficiaryBankName
      row[3] = item.beneficiaryIfscCode
      row[4] = item.beneficiarySwiftCode
      row[5] = <img src={"assets/images/eye.png"} alt='' onClick={async () => {
        setshowLoader(true)
        if (docArray.length > 1) {
          item.bankStatement = await getDocDetails(docArray[0])
          item.bankPassbook = await getDocDetails(docArray[1])
          item.blankCheque = await getDocDetails(docArray[2])
        }
        setbankdetails({
          isVisible: true,
          data: item
        })
        setshowLoader(false)
        // setBank(false)
      }} />
      tableData.push(row)
      row = []
    })
    return tableData
  }

  const getShareHolderData = () => {
    setshowLoader(true)
    let reqObj = {
      currentPage: 1,
      resultPerPage: SHfilter.resultPerPage,
      userId: userId,
      search: SHfilter.search_text
    }
    console.log('Reqa obj getShareHolderGrid', reqObj)
    call('POST', "getShareHolderGrid", reqObj).then(result => {
      setSHdata(formatDataForSHTable(result.message))
      SHsetCount(result.total_records)
      setshowLoader(false)

    }).catch(e => {
      console.log('Error', e)
      setshowLoader(false)
    })
  }
  function formatDataForSHTable(data) {
    let tableData = []
    let row = []
    data.forEach((item, index) => {
      item.Fulladdress = `${item.address_line1 ? item.address_line1 + "," : ""}${item.address_line2 ? item.address_line2 + "," : ""}${item.city ? item.city + "," : ""}${item.state ? item.state + "," : ""}${item.country ? item.country : ''}${item.postal_code ? '-' + item.postal_code : ''}`
      const docArray = item.doc_array ? item.doc_array.split(',') : []

      row[0] = item.name
      row[1] = item.contact_number
      row[2] = item.email_id
      row[3] = item.share_in_company ? item.share_in_company + "%" : ""
      row[4] = item.din
      row[5] = <p className='mb-0 text-color1 font-wt-600 cursor' onClick={async () => {
        if (docArray.length > 1) {
          item.panCard = await getDocDetails(docArray[0])
          item.aadharDoc = await getDocDetails(docArray[1])
        }
        // setShareholder(false)
        // setshareholderdetails({ isVisible: true, data: item })
      }}>View details</p>
      tableData.push(row)
      row = []
    })
    return tableData
  }

  useEffect(() => {
    getfinanceData()
  }, [Finrefresh, Finpage])

  useEffect(() => {
    getUserBankList()
  }, [Bankrefresh, Bankpage])

  useEffect(() => {
    getShareHolderData()
  }, [SHrefresh, SHpage])

  useEffect(() => {
    call('POST', 'getUserCreditRatings', { userId }).then((result) => {
      console.log('running getUserCreditRatings api-->', result);
      setProgressBars(result)
    }).catch((e) => {

    });

    call('POST', 'getCreditReports', { userId }).then((result) => {
      console.log('running getCreditReports api-->', result);
      setCreditReportData(result)
    }).catch((e) => {

    });
  }, [])
  useEffect(() => {
    let tempArray = []
    for (let i = 2000; i <= new Date().getFullYear(); i++) {
      tempArray.push({
        name: i,
        sortname: i
      })
    }
    setyearList(tempArray)
  }, [])

  useEffect(() => {
    if (Object.values(errors).every(data => data === '') && isSubmitted) {
      addFinanceDetails()
    } else {
      setSubmitted(false)
    }
  }, [errors])
  useEffect(() => {
    getSwiftCodes()
    getCountrydata()
  }, [])
  function addFinanceDetails() {
    setshowLoader(true)
    console.log('dataaaaa', data)
    const formdata = new FormData()
    formdata.append('year', data.selectedYear)
    formdata.append('currency', data.currencyType)
    formdata.append('turnover', data.turnover)
    formdata.append('netProfit', data.netprofit)
    formdata.append('netWorth', data.networth)
    formdata.append('finance_doc_current_year', data.AuditDoc)
    formdata.append('gst_doc_6_month', data.GSTDoc)
    formdata.append('debtor_doc', data.debStatement)
    formdata.append('creditors_doc', data.credDocs)
    formdata.append('itr_doc_1_year', data.ITRDoc)
    formdata.append('userId', userId)
    formdata.append('userEmail', userEmail)
    call("POST", "insertuserfinancedetails", formdata).then(result => {
      toastDisplay('Finance details added succesfully', "success")
      setshowLoader(false)
      setSubmitted(false)
      setAddFinanceModal(false)
      getfinanceData()
    }).catch(e => {
      console.log('Error', e)
      toastDisplay('Failed to add Finance details', "error")
      setshowLoader(false)
      setSubmitted(false)
    })
  }
  const handleMultiSelect = async (e, name, val) => {
    // console.log("handleMultiSelect", e, name, val);
    if (e?.[0]?.id === "temp") {
      let allSwiftData = allSwiftCodeData
      allSwiftData.push({ ...e[0], swiftCode: e[0]["typedInput"], id: e[0]["typedInput"] })
      setAllSwiftCodeData(allSwiftData)
      setSwifCodeMaster(allSwiftData)
      setData({
        ...data,
        [name]: e[0]["typedInput"]
      })
    }
    else {
      setData({
        ...data,
        [name]: e?.[0]?.swiftCode ? e.reverse()?.[0]?.swiftCode : null
      });
    }
  };

  const handleFilterOptions = (typedInput, name) => {
    // console.log("typedInput", typedInput);
    let tempPort = []
    let filtered = []
    tempPort = [{ id: "temp", "swiftCode": "Add New Option", typedInput }]
    filtered = allSwiftCodeData.filter((i) => {
      if (i.swiftCode && i.swiftCode.toLowerCase().includes(typedInput.toLowerCase())) {
        return i
      }
    })
    if (!filtered.length) {
      filtered = tempPort
    }
    setSwifCodeMaster(filtered)
  };

  useEffect(() => {
    console.log('Error data printtt', errors, data)
    if (Object.values(errors).every(data => data === '') && isBankSubmitted) {
      handleBankSubmit()
    } else {
      setSubmitted(false)
    }
  }, [errors])

  const handleBankSubmit = () => {
    setshowLoader(true)
    var formData = new FormData();
    formData.append('beneficiaryBankName', data.BenfbankName)
    formData.append('beneficiaryBranch', data.BenfbankName)
    formData.append('beneficiaryBranchAddress', data.BenfAddress)
    formData.append('beneficiaryCity', data.BenfCity)
    formData.append('beneficiaryState', data.bankState)
    formData.append('beneficiaryCountry', data.bankCountry)
    formData.append('beneficiaryPostalCode', data.bankPostal)
    formData.append('beneficiaryAccountName', data.BenfaccountHolder)
    formData.append('beneficiaryAccountNo', data.BenfAccountNumber)
    formData.append('beneficiaryIfscCode', data.BenfIFSCCode)
    formData.append('beneficiarySwiftCode', data.BenfSwiftCode)
    formData.append('email', userEmail)
    formData.append('correspondentBankName', data.CorrbankName)
    formData.append('correspondentSwift', data.CorrSwiftCode)
    formData.append('correspondentAccountNumber', data.CorrAccountNo)
    formData.append('bankStatement', data.Bank_Statement)
    formData.append('bankPassbook', data.Bank_Passbook)
    formData.append('bankblanqueCheck', data.Blank_Cheque)
    formData.append('userId', userId)

    call('POST', 'addBank', formData).then((result) => {
      if (result) {
        console.log('addbank sucess')
        setshowLoader(false)
        getUserBankList()
        toastDisplay("Bank details saved successfuly!", "success", () => {
          window.location.reload()
        });
        setBankSubmitted(false)
      }
    }).catch(err => {
      setshowLoader(false)
      toastDisplay(err, "error");
      setBankSubmitted(false)
    })
  }

  const addShareHolderData = () => {
    setshowLoader(true)
    const formData = new FormData()
    formData.append('name', data.name)
    formData.append('country', data.shareholderCountry)
    formData.append('nationality', data.nationality)
    formData.append('emailId', data.shareholderEmail)
    formData.append('sharePercent', data.sharePercent)
    formData.append('itr', data.itr)
    formData.append('din', data.din)
    formData.append('signatory', data.authSigntature)
    formData.append('PANCard', data.panDoc)
    formData.append('AadhaarCard', data.aadharDoc)
    formData.append('userId', userId)
    formData.append('userEmail', userEmail)
    formData.append('contactNo', data.phone_number)
    formData.append('dob', data.dob)
    formData.append('addressLine1', data.add_1)
    formData.append('addressLine2', data.add_2)
    formData.append('city', data.city)
    formData.append('state', data.state)
    formData.append('postalCode', data.postalCode)

    call('POST', 'insertshareholder', formData).then((result) => {
      //setShareholder(false)
      setshowLoader(false)
      toastDisplay("Shareholder added successfully", "success")
      setSHSubmitted(false)
      setAddSHModal(false)
      getShareHolderData()
    }).catch(e => {
      setshowLoader(false)
      toastDisplay("Failed To add share holder", "error")
      setSHSubmitted(false)
    })
  }

  useEffect(() => {
    if (Object.values(errors).every(data => data === '') && isSHSubmitted) {
      addShareHolderData()
    } else {
      setSHSubmitted(false)
    }
  }, [errors])

  const removeBank = (finDtId) => {
    setshowLoader(true)
    call('POST', 'removeBank', { finDtId }).then(result => {
      toastDisplay('Bank removed succesfully', 'success')
      getUserBankList()
      setbankdetails({
        isVisible: false,
        data: null
      })
      setshowLoader(false)
    }).catch(e => {
      toastDisplay('Failed to delete bank', 'error')
    })
  }

  useEffect(() => {
    getSavedFeatures(userId)
  }, [])
  // #1

  const getSavedFeatures = (reqId) => {
    call("POST", "getuserFeatures", { userId: reqId }).then((response) => {
      const newval = response?.menusNotVisible ? response?.menusNotVisible.toString().split(',') : [];
      const selectedPlan = response?.selectedPlan;
      const featuresToDisable = response?.features_to_desable || [];
      console.log(response, newval, selectedPlan, featuresToDisable, "response data");

      // Update planFeatures based on the selected plan and features to disable
      if (selectedPlan && featuresToDisable) {
        setPlanFeatures((prevPlanFeatures) => {
          const updatedPlanFeatures = { ...prevPlanFeatures };
          const currentPlanFeatures = updatedPlanFeatures[selectedPlan] || {};
          console.log("updatedPlanFeatures", updatedPlanFeatures[selectedPlan])
          // Disable features based on featuresToDisable
          Object.keys(currentPlanFeatures).forEach((feature) => {
            if (featuresToDisable.includes(feature)) {
              currentPlanFeatures[feature] = false; // Disable the feature
            } else {
              currentPlanFeatures[feature] = true; // Enable the feature
            }
          });

          updatedPlanFeatures[selectedPlan] = currentPlanFeatures;
          console.log("updatedPlanFeatures", updatedPlanFeatures)
          return updatedPlanFeatures;
        });
      }
      setSelectedPlan(selectedPlan)
      setexporterData(newval)
    })
  }


  const SaveUserFeatures = (title) => {
    setshowLoader(true);
    const menuNotVisible = [];
    const features_to_desable_names = []
    // console.log("features to", title, planFeatures[selectedPlan])
    Object.keys(planFeatures[title]).forEach(feature => {
      if (planFeatures[title][feature] === false) {
        features_to_desable_names.push(feature)
        if (feature === "Order Management") {
          menuNotVisible.push(21);
        } else if (feature === "Contract Management - Bulk") {
          menuNotVisible.push(11);
        } else if (feature === "Logistics - Container") {
          menuNotVisible.push(15);
        } else if (feature === "EDOCS") {
          menuNotVisible.push(14);
        } else if (feature === "Tally-Accounting") {
          menuNotVisible.push(16);
        } else if (feature === "Buyer Discovery") {
          menuNotVisible.push(25);
        }
        else if (feature === "Logistics - Bulk") {
          menuNotVisible.push(22);

        }
        else {
          const matchingId = exportersNavConfig.find((item) => item.text === feature)?.id;
          menuNotVisible.push(parseInt(matchingId));
        }
      }
    });

    console.log("features to hide", userId)

    call("POST", "userFeatures", {
      userId,
      exporterId: adminUserTokenDetails.user_id,
      menu_not_visible: JSON.stringify(menuNotVisible),
      selectedPlan: title,
      features_to_desable: JSON.stringify(features_to_desable_names)
    })
      .then((success) => {
        setshowLoader(false);
        toastDisplay(success, "success");
      })
      .catch((error) => {
        setshowLoader(false);
        toastDisplay("Something went wrong", "error");
      });
    setshowLoader(false);
  };

  return (
    <>
      {showLoader && (<div className="loading-overlay"><span><img className="" src="assets/images/loader.gif" alt="description" /></span></div>)}
      <ToastContainer position="bottom-right" autoClose={5000} hideProgressBar={false} newestOnTop closeOnClick rtl={false} pauseOnVisibilityChange draggable pauseOnHover />

      {<div className={`modal fade ${addFinanceModal && "show"}`} style={addFinanceModal ? { display: "block", "zIndex": '100001' } : {}}>
        <div className="modal-dialog modal-md mr-0 my-0">
          <div className="modal-content submitmodal pb-4">
            <div className="modal-header border-0">
              <div className="w-100 d-flex align-items-center justify-content-between">
                <label className="font-size-16 font-wt-600 text-color-value mx-3">Add new finance details</label>
                <div className="modal-header border-0">
                  <button type="button" className="btn-close" aria-label="Close" onClick={() => setAddFinanceModal(false)}></button>
                </div>
              </div>
            </div>

            <div className="modal-body px-4">
              <div className=''>
                <div className="row">
                  <div className="col-md-6">
                    <NewSelect isAstrix={false} label={"Select year"}
                      selectData={yearlist} name={"selectedYear"}
                      value={data.selectedYear} optionLabel={"name"} optionValue={'sortname'}
                      onChange={handleChange} error={errors.selectedYear} />
                  </div>
                  <div className="col-md-6">
                    <NewSelect isAstrix={false} label={"Select currency"}
                      selectData={most_used_currencies} name={"currencyType"}
                      value={data.currencyType} optionLabel={"name"} optionValue={'code'}
                      onChange={handleChange} error={errors.currencyType} />
                  </div>
                  <div className="col-md-6">
                    <NewInput isAstrix={false} type={"number"} label={"Turnover"}
                      name={"turnover"} value={data.turnover} error={errors.turnover}
                      onChange={handleChange} />
                  </div>
                  <div className="col-md-6">
                    <NewInput isAstrix={false} type={"number"} label={"Net profit"}
                      name={"netprofit"} value={data.netprofit} error={errors.netprofit}
                      onChange={handleChange} />
                  </div>
                  <div className="col-md-6">
                    <NewInput isAstrix={false} type={"number"} label={"Net Worth"}
                      name={"networth"} value={data.networth} error={errors.networth}
                      onChange={handleChange} />
                  </div>
                </div>
                <p className='text-decoration-underline font-size-14 mt-3'>Attach documents</p>
                <p className='font-size-14 mt-3'>Audit report</p>
                <div className="row">
                  <div className="col-md-8">
                    <div className="col-md-10 px-0 mt-1">
                      <NewInput isAstrix={false} type={"number"} label={"Audit Year"}
                        name={"auditYear"} value={data.selectedYear} error={errors.selectedYear} isDisabled={true}
                      />
                    </div>
                  </div>
                  <div className="col-md-12">
                    <div className="row form-group">
                      <div className="col-md-11">
                        <FileInput name={"AuditDoc"} value={data.AuditDoc} error={errors.AuditDoc}
                          onChange={handleFile} isEditable={true}
                          onUploadCancel={() => setData({ ...data, "AuditDoc": null })} />
                        {errors.AuditDoc ? <div class="text-danger mt-2 font-size-12">
                          <i class="fa fas fa-exclamation-circle mr-1" aria-hidden="true"></i>
                          <b>{errors.AuditDoc}</b></div> : ''}
                      </div>
                    </div>
                  </div>
                </div>
                <p className='font-size-14 mt-3'>GST document</p>
                <div className="row">
                  <div className="col-md-8">
                    <div className="col-md-10 px-0 mt-1">
                      <NewInput isAstrix={false} type={"number"} label={"GST Year"}
                        name={"GSTyear"} value={data.selectedYear} error={errors.selectedYear} isDisabled={true}
                      />
                    </div>
                  </div>
                  <div className="col">
                    <div className="row form-group">
                      <div className="col-md-11">
                        <FileInput name={"GSTDoc"} value={data.GSTDoc} error={errors.GSTDoc}
                          onChange={handleFile} isEditable={true}
                          onUploadCancel={() => setData({ ...data, "GSTDoc": null })} />
                        {errors.GSTDoc ? <div class="text-danger mt-2 font-size-12">
                          <i class="fa fas fa-exclamation-circle mr-1" aria-hidden="true"></i>
                          <b>{errors.GSTDoc}</b></div> : ''}
                      </div>
                    </div>
                  </div>
                </div>

                <p className='font-size-14 mt-3'>ITR document</p>
                <div className="row">
                  <div className="col-md-8">
                    <div className="col-md-10 px-0 mt-1">
                      <NewInput isAstrix={false} type={"number"} label={"ITR Year"}
                        name={"ITR"} value={data.selectedYear} error={errors.selectedYear} isDisabled={true}
                      />
                    </div>
                  </div>
                  <div className="col">
                    <div className="row form-group">
                      <div className="col-md-11">
                        <FileInput name={"ITRDoc"} value={data.ITRDoc} error={errors.ITRDoc}
                          onChange={handleFile} isEditable={true}
                          onUploadCancel={() => setData({ ...data, "ITRDoc": null })} />
                        {errors.ITRDoc ? <div class="text-danger mt-2 font-size-12">
                          <i class="fa fas fa-exclamation-circle mr-1" aria-hidden="true"></i>
                          <b>{errors.ITRDoc}</b></div> : ''}
                      </div>
                    </div>
                  </div>
                </div>
                <p className='font-size-14 mt-3'>Debtors statement</p>
                <div className="row">
                  <div className="col">
                    <div className="row form-group">
                      <div className="col-md-11">
                        <FileInput name={"debStatement"} value={data.debStatement} error={errors.debStatement}
                          onChange={handleFile} isEditable={true}
                          onUploadCancel={() => setData({ ...data, "debStatement": null })} />
                        {errors.debStatement ? <div class="text-danger mt-2 font-size-12">
                          <i class="fa fas fa-exclamation-circle mr-1" aria-hidden="true"></i>
                          <b>{errors.debStatement}</b></div> : ''}
                      </div>
                    </div>
                  </div>
                </div>

                <p className='font-size-14 mt-3'>Creditors statement</p>
                <div className="row">
                  <div className="col">
                    <div className="row form-group">
                      <div className="col-md-11">
                        <FileInput name={"credDocs"} value={data.credDocs} error={errors.credDocs}
                          onChange={handleFile} isEditable={true}
                          onUploadCancel={() => setData({ ...data, "credDocs": null })} />
                        {errors.credDocs ? <div class="text-danger mt-2 font-size-12">
                          <i class="fa fas fa-exclamation-circle mr-1" aria-hidden="true"></i>
                          <b>{errors.credDocs}</b></div> : ''}
                      </div>
                    </div>
                  </div>
                </div>
                <button onClick={() => {
                  setErrors(validateAddFinance(data))
                  setSubmitted(true)
                }} className={`my-4 new-btn py-2 px-2 text-white cursor`}>Add new finance details</button>
              </div>
            </div>
          </div>
        </div>
      </div>
      }
      {<div className={`modal fade ${addBankModal && "show"}`} style={addBankModal ? { display: "block", "zIndex": '100001' } : {}}>
        <div className="modal-dialog modal-md mr-0 my-0">
          <div className="modal-content submitmodal pb-4">
            <div className="modal-header border-0">
              <div className="w-100 d-flex align-items-center justify-content-between">
                <label className="font-size-16 font-wt-600 text-color-value mx-3">Add new bank</label>
                <div className="modal-header border-0">
                  <button type="button" className="btn-close" aria-label="Close" onClick={() => setAddBankModal(false)}></button>
                </div>
              </div>
            </div>

            <div className="modal-body px-4">
              <>
                <>
                  <p className='font-size-13 mb-2'>Beneficiary bank details</p>
                  <div className='row'>
                    <div className="col-md-6 pt-1 ">
                      <div className="col-md-11 px-0">
                        <NewInput isAstrix={true} type={"text"} label={"Bank name"}
                          name={"BenfbankName"} value={data.BenfbankName} error={errors.BenfbankName}
                          onChange={handleChange} />
                      </div>
                    </div>
                    <div className="col-md-6 pt-1">
                      <div className="col-md-11 px-0">
                        <NewInput isAstrix={true} type={"text"} label={"Branch"}
                          name={"BenfbranchName"} value={data.BenfbranchName} error={errors.BenfbranchName}
                          onChange={handleChange} />
                      </div>
                    </div>
                    <div className="col-md-6 pt-1">
                      <div className="col-md-11 px-0">
                        <NewInput isAstrix={true} type={"text"} label={"Account holder name"}
                          name={"BenfaccountHolder"} value={data.BenfaccountHolder} error={errors.BenfaccountHolder}
                          onChange={handleChange} />
                      </div>
                    </div>
                    <div className="col-md-6 pt-1">
                      <div className="col-md-11 px-0">
                        <NewInput isAstrix={true} type={"text"} label={"Account no."}
                          name={"BenfAccountNumber"} value={data.BenfAccountNumber} error={errors.BenfAccountNumber}
                          onChange={handleChange} />
                      </div>
                    </div>
                    <div className="col-md-6 pt-1">
                      <div className="col-md-11 px-0">
                        <NewInput isAstrix={true} type={"text"} label={"IFSC code"}
                          name={"BenfIFSCCode"} value={data.BenfIFSCCode} error={errors.BenfIFSCCode}
                          onChange={handleChange} />
                      </div>
                    </div>
                    <div className="col-md-6 pt-1">
                      <div className="col-md-11 px-0">
                        <MultipleSelect
                          Id="SWIFT code"
                          Label="SWIFT code"
                          filterOption={() => true}
                          onInputChange={(e) => {
                            handleFilterOptions(e, "swiftCodedata")
                          }}
                          optiondata={swiftCodedata}
                          onChange={(e) => handleMultiSelect(e, "BenfSwiftCode", "swiftCode")}
                          value={data.BenfSwiftCode ? [data.BenfSwiftCode] : []}
                          name="BenfSwiftCode"
                          labelKey={"swiftCode"}
                          valKey={"swiftCode"}
                          error={errors.BenfSwiftCode}
                        />
                      </div>
                    </div>
                    <div className="col-md-6 pt-1">
                      <div className="col-md-11 px-0">
                        <NewSelect isAstrix={true} label={"Country"}
                          selectData={countrys} name={"bankCountry"}
                          value={data.bankCountry} optionLabel={"name"} optionValue={'sortname'}
                          onChange={handleChange} error={errors.bankCountry} />
                      </div>
                    </div>
                    <div className="col-md-6 pt-1">
                      <div className="col-md-11 px-0">
                        <NewSelect isAstrix={true} label={"State"}
                          selectData={states} name={"bankState"}
                          value={data.bankState} optionLabel={"name"} optionValue={'sortname'}
                          onChange={handleChange} error={errors.bankState} />
                      </div>
                    </div>
                    <div className="col-md-6 pt-1">
                      <div className="col-md-11 px-0">
                        <NewInput isAstrix={true} type={"text"} label={"City"}
                          name={"BenfCity"} value={data.BenfCity} error={errors.BenfCity}
                          onChange={handleChange} />
                      </div>
                    </div>
                    <div className="col-md-6 pt-1">
                      <div className="col-md-11 px-0">
                        <NewInput isAstrix={true} type={"text"} label={"Address"}
                          name={"BenfAddress"} value={data.BenfAddress} error={errors.BenfAddress}
                          onChange={handleChange} />
                      </div>
                    </div>
                    <div className="col-md-6 pt-1">
                      <div className="col-md-11 px-0">
                        <NewInput isAstrix={true} label={"Postal Code"} type="number"
                          name={"bankPostal"} value={data.bankPostal}
                          onChange={handleChange} error={errors.bankPostal} />
                      </div>
                    </div>
                  </div>
                </>
                <>
                  <p className='font-size-13 mt-4 text-decoration-underline'>Attach documents</p>
                  <div className='row'>
                    <div className="col">
                      <label className="font-size-13">Bank statement</label>
                      <div className="row form-group">
                        <div className="col-md-11">
                          <FileInput name={"Bank_Statement"} value={data.Bank_Statement} error={errors.Bank_Statement}
                            onChange={handleFile} isEditable={true}
                            onUploadCancel={() => setData({ ...data, "Bank_Statement": null })} />
                          {errors.Bank_Statement ? <div class="text-danger mt-2 font-size-12">
                            <i class="fa fas fa-exclamation-circle mr-1" aria-hidden="true"></i>
                            <b>{errors.Bank_Statement}</b></div> : ''}
                        </div>
                      </div>
                    </div>
                    <div className="col">
                      <label className="font-size-13">Blank cheque</label>
                      <div className="row form-group">
                        <div className="col-md-11">
                          <FileInput name={"Blank_Cheque"} value={data.Blank_Cheque} error={errors.Blank_Cheque}
                            onChange={handleFile} isEditable={true}
                            onUploadCancel={() => setData({ ...data, "Blank_Cheque": null })} />
                          {errors.Blank_Cheque ? <div class="text-danger mt-2 font-size-12">
                            <i class="fa fas fa-exclamation-circle mr-1" aria-hidden="true"></i>
                            <b>{errors.Blank_Cheque}</b></div> : ''}
                        </div>
                      </div>
                    </div>
                    <div className="col">
                      <label className="font-size-13">Passbook</label>
                      <div className="row form-group">
                        <div className="col-md-11">
                          <FileInput name={"Bank_Passbook"} value={data.Bank_Passbook} error={errors.Bank_Passbook}
                            onChange={handleFile} isEditable={true}
                            onUploadCancel={() => setData({ ...data, "Bank_Passbook": null })} />
                          {errors.Bank_Passbook ? <div class="text-danger mt-2 font-size-12">
                            <i class="fa fas fa-exclamation-circle mr-1" aria-hidden="true"></i>
                            <b>{errors.Bank_Passbook}</b></div> : ''}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className='mt-3'>
                    <img
                      onClick={() => setData({ ...data, tcAccepted: !data.tcAccepted })}
                      className='cursor mr-3' src={`assets/images/${data.tcAccepted ? 'checked-green' : 'empty-check'}.png`} />
                    <label>Select as default bank</label>
                  </div>
                </>
                <button onClick={() => {
                  setErrors(validateAddBank(data))
                  setBankSubmitted(true)
                }} className={`my-4 new-btn py-2 px-2 text-white cursor`}>Add new bank details</button>
              </>
            </div>
          </div>
        </div>
      </div>
      }
      {<div className={`modal fade ${addSHModal && "show"}`} style={addSHModal ? { display: "block", "zIndex": '100001' } : {}}>
        <div className="modal-dialog modal-md mr-0 my-0">
          <div className="modal-content submitmodal pb-4">
            <div className="modal-header border-0">
              <div className="w-100 d-flex align-items-center justify-content-between">
                <label className="font-size-16 font-wt-600 text-color-value mx-3">Add new bank</label>
                <div className="modal-header border-0">
                  <button type="button" className="btn-close" aria-label="Close" onClick={() => setAddSHModal(false)}></button>
                </div>
              </div>
            </div>

            <div className="modal-body px-4">
              <>
                <div className='row'>
                  <div className="col-md-12 pt-1 ">
                    <div className="col-md-11 px-0">
                      <InputWithSelect isAstrix={true} type={"text"} label={"Name"}
                        selectData={[{ name: "Mr" }, { name: "Miss" }]}
                        selectName={"nameTitle"} selectValue={data.nameTitle}
                        optionLabel={"name"} optionValue={'name'}
                        name={'name'} value={data.name} error={errors.name}
                        onChange={handleChange} />
                    </div>
                  </div>
                  <div className="col-md-12 pt-1 ">
                    <div className="col-md-11 px-0">
                      <InputWithSelect isAstrix={true} type={"text"} label={"Contact number"}
                        selectData={countrys}
                        selectName={"phonecode"} selectValue={data.phonecode}
                        optionLabel={"phonecode"} optionValue={'phonecode'}
                        name={'phone_number'} value={data.phone_number} error={errors.phone_number}
                        onChange={handleChange} />
                    </div>
                  </div>
                  <div className="col-md-12 pt-1 ">
                    <div className="col-md-11 px-0">
                      <NewInput isAstrix={true} type={"text"} label={"Email ID"}
                        name={"shareholderEmail"} value={data.shareholderEmail} error={errors.shareholderEmail}
                        onChange={handleChange} />
                    </div>
                  </div>
                  <div className="col-md-12 pt-1 ">
                    <div className="col-md-11 px-0">
                      <NewInput isAstrix={true} type={"date"} label={"Date of birth"}
                        name={"dob"} value={data.dob} error={errors.dob}
                        onChange={handleChange} />
                    </div>
                  </div>
                  <div className="col-md-12 pt-1 ">
                    <div className="col-md-11 px-0">
                      <NewInput isAstrix={true} type={"text"} label={"Address line 1"}
                        name={"add_1"} value={data.add_1} error={errors.add_1}
                        onChange={handleChange} />
                    </div>
                  </div>
                  <div className="col-md-12 pt-1 ">
                    <div className="col-md-11 px-0">
                      <NewInput isAstrix={true} type={"text"} label={"Address line 2"}
                        name={"add_2"} value={data.add_2} error={errors.add_2}
                        onChange={handleChange} />
                    </div>
                  </div>
                  <div className="col-md-12 pt-1 ">
                    <div className="col-md-11 px-0">
                      <NewSelect isAstrix={true} type={"text"} label={"City"}
                        selectData={cities} optionLabel={"city"} optionValue={'city'}
                        name={"city"} value={data.city} error={errors.city}
                        onChange={handleChange} />
                    </div>
                  </div>
                  <div className="col-md-12 pt-1">
                    <div className="col-md-11 px-0">
                      <NewSelect isAstrix={true} label={"State"}
                        selectData={states} name={"state"}
                        value={data.state} optionLabel={"name"} optionValue={'name'}
                        onChange={handleChange} error={errors.state} />
                    </div>
                  </div>
                  <div className="col-md-12 pt-1 ">
                    <div className="col-md-11 px-0">
                      <NewInput isAstrix={true} type={"text"} label={"Nationality"}
                        name={"nationality"} value={data.nationality} error={errors.nationality}
                        onChange={handleChange} />
                    </div>
                  </div>
                  <div className="col-md-12 pt-1">
                    <div className="col-md-11 px-0">
                      <NewInput isAstrix={true} label={"Postal Code"} type="number"
                        name={"postalCode"} value={data.postalCode}
                        onChange={handleChange} error={errors.postalCode} />
                    </div>
                  </div>
                  <div className="col-md-12 pt-1">
                    <div className="col-md-11 px-0">
                      <NewSelect isAstrix={true} label={"Country"}
                        selectData={countrys} name={"shareholderCountry"}
                        value={data.shareholderCountry} optionLabel={"name"} optionValue={'sortname'}
                        onChange={handleChange} error={errors.shareholderCountry} />
                    </div>
                  </div>
                  <div className="col-md-12 pt-1 ">
                    <div className="col-md-11 px-0">
                      <NewInput isAstrix={true} type={"text"} label={"No. of shares"}
                        name={"sharePercent"} value={data.sharePercent} error={errors.sharePercent}
                        onChange={handleChange} />
                    </div>
                  </div>
                  <div className="col-md-12 pt-1 ">
                    <div className="col-md-11 px-0">
                      <NewInput isAstrix={true} type={"text"} label={"Direct identification no."}
                        name={"din"} value={data.din} error={errors.din}
                        onChange={handleChange} />
                    </div>
                  </div>
                  <div className="col-md-12 pt-1 ">
                    <div className="col-md-11 px-0">
                      <NewInput isAstrix={true} type={"text"} label={"Authorized signatory"}
                        selectData={[{ name: true }, { name: false }]} optionLabel={"name"} optionValue={'name'}
                        name={"authSigntature"} value={data.authSigntature} error={errors.authSigntature}
                        onChange={handleChange} />
                    </div>
                  </div>
                  <div className="col-md-12 pt-1 ">
                    <div className="col-md-11 px-0">
                      <NewInput isAstrix={true} type={"text"} label={"ITR (for Indians only)"}
                        name={"itr"} value={data.itr} error={errors.itr}
                        onChange={handleChange} />
                    </div>
                  </div>
                </div>

                <>
                  <p className='font-size-13 mt-4 text-decoration-underline'>Attach documents</p>
                  <div className='row'>
                    <div className="col-md-12">
                      <label className="font-size-13">Pancard</label>
                      <div className="row form-group">
                        <div className="col-md-11">
                          <FileInput name={"panDoc"} value={data.panDoc} error={errors.panDoc}
                            onChange={handleFile} isEditable={true}
                            onUploadCancel={() => setData({ ...data, "panDoc": null })} />
                          {errors.panDoc ? <div class="text-danger mt-2 font-size-12">
                            <i class="fa fas fa-exclamation-circle mr-1" aria-hidden="true"></i>
                            <b>{errors.panDoc}</b></div> : ''}
                        </div>
                      </div>
                    </div>
                    <div className="col-md-12">
                      <label className="font-size-13">Aadhaar card</label>
                      <div className="row form-group">
                        <div className="col-md-11">
                          <FileInput name={"aadharDoc"} value={data.aadharDoc} error={errors.aadharDoc}
                            onChange={handleFile} isEditable={true}
                            onUploadCancel={() => setData({ ...data, "aadharDoc": null })} />
                          {errors.aadharDoc ? <div class="text-danger mt-2 font-size-12">
                            <i class="fa fas fa-exclamation-circle mr-1" aria-hidden="true"></i>
                            <b>{errors.aadharDoc}</b></div> : ''}
                        </div>
                      </div>
                    </div>
                  </div>
                </>
                <button onClick={() => {
                  setErrors(validateAddShareholder(data))
                  setSHSubmitted(true)
                }} className={`my-4 new-btn py-2 px-2 text-white cursor`}>Add shareholder details</button>
              </>
            </div>
          </div>
        </div>
      </div>
      }
      <div className='card border-0 chatlist p-4 mt-4'>

        {!financedetails.isVisible &&
          <>
            {/* <div className='d-flex flex-row justify-content-between align-items-center'>
              <div className='font-size-14 font-wt-600  text-decoration-underline'>User Features Disable</div>
              <div className="d-flex gap-4">
                <button className={`new-btn  py-2 px-2 text-white cursor`} onClick={SaveUserFeatures}>Save </button>
              </div>
            </div> */}
            {/* <div className='d-flex flex-row justify-content-between align-items-center'>
            <div className='font-size-14 font-wt-600  text-decoration-underline'>Choose Plan</div>
            <div className="d-flex gap-4">
              <button className={`new-btn  py-2 px-2 text-white cursor`} onClick={SaveUserFeatures}>Save </button>
            </div>
          </div>
            <div className='my-2 w-full'>
              <div className=' ml-4'>

                <div className='w-full'>
                  <NewTablev2
                    columns={[{ subColumns: "Service Name", subColumnStyle: { width: '90%' } }, { subColumns: "Access", subColumnStyle: { width: '10%' } }]}
                  >
                    {filteruseraccess.map((i, j) => {
                      return (
                        <tr>
                          <td><label className='font-size-14 font-wt-500 text-break' >{i.text}</label></td>
                          <td><img className='cursor'

                            onClick={() => {
                              if (exporterData.includes(i.id)) {
                                const newdata = exporterData.filter((ele) => ele !== i.id)
                                setexporterData([...newdata]);
                              } else {
                                const newdata = exporterData
                                newdata.push(i.id)
                                setexporterData([...newdata])
                              }
                            }}
                            src={`assets/images/${exporterData.includes(i.id) ? 'checked_vector' : 'unchecked_vector'}.svg`}
                            height={21} width={21}
                            alt="checkbox"
                          /></td>
                        </tr>
                      )
                    })}

                  </NewTablev2>

                </div>
              </div>
            </div> */}
            <div className='d-flex flex-row justify-content-between align-items-center'>
              <div className='font-size-14 font-wt-600  text-decoration-underline'>Choose Plan</div>
              {/* <div className="d-flex gap-4">
                <button className={`new-btn  py-2 px-2 text-white cursor`} onClick={SaveUserFeatures}>Save </button>
              </div> */}
            </div>
            <div className='my-2 w-full'>
              <div className=' ml-4'>
                <div className="d-flex justify-content-between">
                  {/* Render the tables for Container, Bulk, and Finance categories dynamically */}
                  {Object.keys(planFeatures).map((category, index) => (
                    <div key={index} className="flex-grow-1 mx-2" style={{ minWidth: "0", }}>
                      <FeatureTable
                        key={index}
                        title={`${category}`}
                        features={generateFeatures(category)}
                        planFeatures={planFeatures}
                        setPlanFeatures={setPlanFeatures}
                        selectedPlan={selectedPlan}
                        setSelectedPlan={setSelectedPlan}
                        SaveUserFeatures={SaveUserFeatures}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>

        }


      </div>

      <div className='card border-0 chatlist p-4 mt-4'>
        {!bankdetails.isVisible &&
          <>
            <div className='d-flex flex-row justify-content-between align-items-center'>
              <div className='font-size-14 font-wt-600  text-decoration-underline'>Bank</div>
              <div className="d-flex gap-4">
                <button className={`new-btn  py-2 px-2 text-white cursor`} onClick={() => setAddBankModal(true)}>Add new Bank</button>
              </div>
            </div>
            <div className='my-2'>
              <div className='filter-div ml-4'>
                <Filter
                  filterData={BankfilterData} setFilterData={BanksetFilter} showFilterBtn={true}
                  showResultPerPage={true} count={BankCount} filter={Bankfilter} setFilter={BanksetFilter} refresh={Bankrefresh} setRefresh={Banksetrefresh} />
              </div>
              <div>
                <NewTable
                  disableAction={true}
                  columns={[
                    { name: "Accountholder name", filter: true },
                    { name: "Account No.", filter: true },
                    { name: "Bank name", filter: true },
                    { name: "IFSC Code", filter: true },
                    { name: "SWIFT Code", filter: true },
                    { name: "", filter: false }]}
                  data={Bankdata} />
                <Pagination page={Bankpage} totalCount={BankCount} onPageChange={(p) => Banksetpage(p)} refresh={Bankrefresh} setRefresh={Banksetrefresh} perPage={Bankfilter.resultPerPage || 10} />

              </div>
            </div>
          </>
        }

        {bankdetails.isVisible && <>
          <div className="row">
            <div className='d-flex justify-content-between'>
              <div>
                <img className='cursor' src={"/assets/images/ArrowBackLeft.png"} alt="" onClick={() => {
                  setbankdetails({
                    isVisible: false,
                    data: null
                  })
                }} />
              </div>
              <div className='d-flex '>
                <img src={"/assets/images/charm_download.png"} alt="" className='px-2 cursor' onClick={async () => {
                  let pdfArr = []
                  if (bankdetails.data.bankStatement && !isEmpty(bankdetails.data.bankStatement)) {
                    pdfArr.push(await getPDFFromFile(bankdetails.data.bankStatement))
                  }
                  if (bankdetails.data.blankCheque && !isEmpty(bankdetails.data.blankCheque)) {
                    pdfArr.push(await getPDFFromFile(bankdetails.data.blankCheque))
                  }
                  if (bankdetails.data.bankPassbook && !isEmpty(bankdetails.data.bankPassbook)) {
                    pdfArr.push(await getPDFFromFile(bankdetails.data.bankPassbook))
                  }
                  printDiv("bankdetails", `BankDetails-${bankdetails.data.beneficiaryAccountName}`, pdfArr)
                }} />
                <img src={"/assets/images/deleteIcon.png"} alt="" className='px-2 cursor' onClick={() => { removeBank(bankdetails.data.id) }} />
              </div>
            </div>
            <div className='row' id='bankdetails'>
              <div className='col'>
                <label className='font-size-14 mt-2'><u>Beneficiary Bank Details</u></label>
                <div className='py-2'>
                  {BenfbankDetails.map((item) => {
                    return (
                      <div className="col-md-6">
                        <p className="d-flex d-flex align-items-top mb-2"><span className="col-md-9 px-0 BuyerdetailsLabel">{item.name}</span><span className="mx-3">:</span><span className="col-md-12 px-0 shareHolderValue" > {bankdetails.data[item.val] ? (bankdetails.data[item.val]) + (item.unit ? item.unit : '') : "NA"}</span> </p>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className='col'>
                <label className='font-size-14 mt-2'><u>Correspondent Bank Details</u></label>
                <div className='py-2'>
                  {CorrbankDetails.map((item) => {
                    return (
                      <div className="col-md-6">
                        <p className="d-flex d-flex align-items-top mb-2"><span className="col-md-5 px-0 BuyerdetailsLabel">{item.name}</span><span className="mx-3">:</span><span className="col-md-12 px-0 shareHolderValue"> {bankdetails.data[item.val] ? (bankdetails.data[item.val]) + (item.unit ? item.unit : '') : "NA"}</span> </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            <div className="row">
              <label className="font-size-15 font-wt-500">
                <u>
                  Documents
                </u>
              </label>
              <div className="row">
                <div className='col-5'>
                  <label className='pl-2 font-size-14'>Bank Statement</label>
                  <FileInput name={"bankStatement"} isEditable={false} value={bankdetails.data.bankStatement} />
                </div>
                <div className='col-5'>
                  <label className='pl-2 font-size-14'>Blank Cheque</label>
                  <FileInput name={"blankCheque"} isEditable={false} value={bankdetails.data.blankCheque} />
                </div>
              </div>
              <div className="row">
                <div className="col-5">
                  <label className='pl-2 font-size-14'>Passbook</label>
                  <FileInput name={"bankPassbook"} isEditable={false} value={bankdetails.data.bankPassbook} />
                </div>
              </div>

            </div>
          </div>
        </>

        }
      </div>

      <div className='card border-0 chatlist p-4 mt-4'>
        <div className='d-flex flex-row justify-content-between align-items-center'>
          <div className='font-size-14 font-wt-600  text-decoration-underline'>Shareholders</div>
          <div className="d-flex gap-4">
            <button className={`new-btn  py-2 px-2 text-white cursor`} onClick={() => setAddSHModal(true)}>Add new shareholder</button>
          </div>
        </div>
        <div className='my-2'>
          <div className='filter-div ml-4'>
            <Filter
              filterData={SHfilterData} setFilterData={SHsetFilter} showFilterBtn={true}
              showResultPerPage={true} count={SHCount} filter={SHfilter} setFilter={SHsetFilter} refresh={SHrefresh} setRefresh={SHsetrefresh} />
          </div>
          <div>
            <NewTable
              disableAction={true}
              columns={[
                { name: "Name", filter: true },
                { name: "Contact no.", filter: true },
                { name: "Email ID", filter: true },
                { name: "Holdings", filter: true },
                { name: "Direct identification no.", filter: true },
                { name: "", filter: false }
              ]}
              data={SHdata} />
            <Pagination page={SHpage} totalCount={SHCount} onPageChange={(p) => SHsetpage(p)} refresh={SHrefresh} setRefresh={SHsetrefresh} perPage={SHfilter.resultPerPage || 10} />

          </div>
        </div>
      </div>

      <div className='card border-0 chatlist p-4 mt-4'>
        {showPopup && <FinanceInvoiceModal limitinvoice={showPopup} setLimitinvoice={togglePopup} closeSuccess={() => togglePopup(false)} >
          <div className="col-md-10 mb-2 ml-5">
            <label className='text-center font-wt-600 text-color1 font-size-14 mb-2'>Upload Credit Report</label>
            <div className='position-relative'>
              <NewSelect label={"Select Report Provider Name"}
                selectData={[{ "name": "Equifax" }, { "name": "Trans Union" }, { "name": "Experian" }, { "name": "S&P Global" }, { "name": "D&B" }]} name={"agencyName"}
                value={data["agencyName"]} optionLabel={"name"} optionValue={'name'}
                onChange={handleChange} error={errors.agencyName} />
            </div>
            <FileInput
              onUploadCancel={() => { setData({ ...data, creditReportDoc: {} }) }} name={"creditReportDoc"} value={data["creditReportDoc"]} onChange={handleFile}
              error={errors.creditReportDoc} isEditable={true} />
            <div className="justify-content-center">
              <button
                onClick={() => {
                  let err = {}
                  if (!data.agencyName) {
                    err["agencyName"] = "Select Agency Name"
                  }
                  if (!data.creditReportDoc?.name) {
                    err["creditReportDoc"] = "Select Document to Upload"
                  }
                  if (!Object.keys(err).length) {
                    setshowLoader(true)
                    let formData = new FormData()
                    formData.append("userId", 5130)
                    formData.append("agencyName", data.agencyName)
                    formData.append("file", data.creditReportDoc)
                    call('POST', 'uploadCreditReport', formData).then((res) => {
                      toastDisplay(res, "success")
                      setshowLoader(false)
                      togglePopup(false)
                      setData({ ...data, creditReportDoc: {}, agencyName: '' })
                    })
                  }
                  setErrors(err)
                }}
                type="button" className={`new-btn w-100 py-2 px-2 mt-3 text-white cursor`}>
                Save
              </button>
            </div>
          </div>
        </FinanceInvoiceModal>}
        <div className='px-5 py-4 pt-5'>
          <p className='font-size-14 font-wt-600'>Credit score</p>
          <div className="row d-flex px-2 pt-2">
            {ProgressBars.map((item, index) => {
              return (
                <div className="bg-white w-43 card-layout mr-5 mb-4 px-4 py-2">
                  <label className="font-wt-400 font-size-14" >{item.agencyName.toUpperCase().split("_").join(" ")}</label>
                  <CustomProgressBar
                    value={item["creditResp"]["rating_"].includes("A") ? 4 : item["creditResp"]["rating_"].includes("B") ? 3 :
                      item["creditResp"]["rating_"].includes("C") ? 2 :
                        item["creditResp"]["rating_"].includes("D") ? 1 : 1}
                    textValue={item["creditResp"]["rating_"]} reverse={true}
                    min={1} max={4} />
                  <div className="row pt-2 d-flex">
                    <div className="w-50">
                      <label>{"High Risk"} <label className="font-wt-600"></label></label>
                    </div>
                    <div className="w-50 text-right">
                      <label>{"Low Risk"} <label className="font-wt-600"></label></label>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
          <p className='font-size-14 font-wt-600 mt-3'>Purchase credit report</p>
          <div className='row pb-5 '>
            <div className='col-md-4 mt-4'>
              <div className='card creditcard p-3 uploadCreditReportView'>
                <div className='d-flex flex-column justify-content-center align-items-center'>
                  <div className='uploadCreditReportIcon d-flex'
                    onClick={() => togglePopup(true)}
                  >
                    <img className='pt-1'
                      style={{
                        "width": "2rem",
                        "height": "2rem"
                      }} src={"assets/images/add_black_icon.png"} />
                  </div>
                  <div>
                    <label className='text-color1 font-wt-600 font-size-14 mt-3' >Upload Credit Report</label>
                  </div>
                </div>
              </div>
            </div>
            {creditreportdata.map((key) => {
              return (
                <div className='col-md-4 mt-4'>
                  <div className='card creditcard p-3'>
                    <div className='d-flex align-items-center'>
                      <div className='col-6'>
                        <img src={key.logo} alt='' height={20} />
                        <h6>{key.companyname}</h6>
                      </div>
                      <div className='col-6'>
                        {/* <h3 className='text-end text-color1 font-wt-600'>$ 10</h3> */}
                      </div>
                    </div>
                    {creditReportData?.[key.alt]?.["docId"] ? (
                      <div className='col-10 mb-2 mt-3 font-size-14'><p>Uploaded
                        <img className='ml-2' style={{ width: '1.3rem', height: '1.3rem' }} src={"assets/images/green_tick.png"} /></p></div>
                    ) : (
                      <div className='col-10 mb-2 mt-3 font-size-14'><p>
                      </p></div>)}
                    {/* <div className='d-flex align-items-center'> */}
                    {creditReportData?.[key.alt]?.["docId"] ? (
                      <div className="d-flex justify-content-center">
                        <button
                          onClick={async () => {
                            let docFileObj = await getDocDetails(creditReportData?.[key.alt]?.["docId"])
                            toggleViewDoc({ show: true, doc: docFileObj })
                          }}
                          type="button" className={`new-btn w-80 py-2 px-2 mt-3 text-white cursor`}>
                          View Report
                        </button>
                      </div>
                    ) : (
                      <div className="d-flex justify-content-center">
                        <button
                          onClick={() => window.open(key.link)}
                          type="button" className={`new-btn w-80 py-2 px-2 mt-3 text-white cursor`}>
                          Get Report
                        </button>
                      </div>)}
                  </div>
                </div>
              );
            })}

          </div>
        </div >
      </div>


    </>
  )
}

export default UserProfileTab