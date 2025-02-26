import React, { useEffect, useRef } from "react";
import { useState } from "react";
import ReactCountryFlag from "react-country-flag";
import call from "../../service";
import moment from "moment";

import { connect } from "react-redux";
import Pagination from "../InvoiceDiscounting/contract/components/pagination";
import { NewTable } from "../../utils/newTable";
import Filter from "../InvoiceDiscounting/components/Filter";
import toastDisplay from "../../utils/toastNotification";
import CustomLineChart from "./CustomLineChart";
import { InputWithSelect, NewInput, NewSelect } from "../../utils/newInput";
import PieChartComponent from "../Reports/components/PieChartComponent";
import {
  ExportExcel,
  getContactObject,
  getFiscalYearDates,
  getFiscalYearsDropdown,
  gettotalCount,
  isEmpty,
} from "../../utils/myFunctions";
import axios from "axios";
import { platformBackendUrl, platformURL } from "../../urlConstants";
import { ToastContainer } from "react-toastify";
const fiscalyears = getFiscalYearsDropdown();
const countriesColor = ["#8B1170", "#C134A2", "#E96DCD", "#FF8BE6", "#FFC0F1"];
const lanesColor = ["#8B4C11", "#A8672B", "#CD8F55", "#ECB27D", "#F4D0AE"];
const shipmentsFrom = ["#11708B", "#1B94B7", "#4DBFE0", "#76DDFB", "#AFEDFF"];
const shipmentsTo = ["#118B49", "#27B96A", "#59DC95", "#7AF5B3", "#A6FFCF"];
const reviewForm = [
  { name: "Trade Name", val: "EXPORTER_NAME" },
  { name: "Legal Name", val: "EXPORTER_NAME" },
  { name: "Contact Person", val: "contact_person" },
  { name: "Contact No.", val: "contact_number" },
  { name: "Address", val: "EXPORTER_ADDRESS" },
];

const reviewForm2 = [
  {
    name: "Contact No.",
    val: "Contact Number",
  },
  {
    name: "Email ID",
    val: "Email ID",
  },
];

export const auditorForm = [
  { name: "Name", val: "AUDITOR_NAME" },
  { name: "Membership Number", val: "MEMBERSHIP_NUMBER" },
  { name: "Contact Person", val: "MEMBER_NAME" },
  { name: "PAN Number", val: "IT_PAN" },
  { name: "Address", val: "AUDITOR_ADDRESS" },
];
const CRMUserDetails = ({ data, goBack, userTokenDetails, navToggleState }) => {
  let todayDateObj = moment();
  let lastMonthDateObj = moment().subtract("1", "year");
  const [salesPerson, setSalesPerson] = useState([]);
  const [hsnCodes, sethsnCodes] = useState([]);
  const [isOrganisationExpanded, setIsOrganisationExpanded] = useState(true);
  const [isContactDetails, setIsContactsExpanded] = useState(true);
  const [isAuditorExpanded, setIsAuditorExpanded] = useState(true);
  const [isShipmentsExpanded, setIsShipmentsExpanded] = useState(false);
  const [isBuyersExpanded, setIsBuyersExpanded] = useState(false);
  const [isTaskExpanded, setIsTaskExpanded] = useState(false);
  const [isLeadCreatedExpanded, setIsLeadCreatedExpanded] = useState(false);
  const [isHSCodesExpanded, setIsHSCodesExpanded] = useState(false);
  const [HSDetails, setHSDetails] = useState({
    show: false,
    data: [],
    selectedHS: null,
  });
  const [countriesPopup, togglecountriesPopup] = useState({
    show: false,
    data: [],
  });
  const [buyersPopup, togglebuyersPopup] = useState({ show: false, data: [] });

  const [activeIndex, setActiveIndex] = useState(0);
  const [hsExpanded, setHSExpanded] = useState({});
  const [showLoader, setShowLoader] = useState(false);
  const [graphConfiguration, setGraphConfiguration] = useState({});
  const [graphdata, setgraphdata] = useState({});
  const graphdataRef = useRef({});
  const [chartconfig, setChartConfig] = useState({});
  const chartconfigRef = useRef({});
  const [exportHistory, setexportHistory] = useState({});
  const exportHistoryRef = useRef({});
  const [exportchartconfig, setexportchartconfig] = useState({});
  const exportchartconfigRef = useRef({});
  const [quantitychartconfig, setquantitychartconfig] = useState({});
  const quantitychartconfigRef = useRef({});
  const [countriesChart, setCountriesChart] = useState({});
  const countriesChartRef = useRef({});
  const [lanesChart, setlanesChart] = useState({});
  const lanesChartRef = useRef({});
  const [shipmentsFromChart, setshipmentsFromChart] = useState({});
  const shipmentsFromChartRef = useRef({});
  const [shipmentsToChart, setshipmentsToChart] = useState({});
  const shipmentsToChartRef = useRef({});
  const [countriesFilter, setCountriesFilter] = useState({});
  const [lanesFilter, setLanesFilter] = useState({});
  const [shipmentsFromFilter, setShipmentsFromFilter] = useState({});
  const [shipmentsToFilter, setShipmentsToFilter] = useState({});
  const [graphTableMode, setGraphTableMode] = useState({});
  const [graphColumns, setGraphColumns] = useState({});
  const [tab, setTab] = useState({});
  const [exportHistoryTableData, setexportHistoryTableData] = useState({});
  const [priceHistoryTableData, setPriceHistoryTableData] = useState({});

  //Shipments variables
  const [shipmentsdata, setShipmentdata] = useState([]);
  const [shipmentCount, setShipmentCount] = useState(0);
  const [refresh, setRefresh] = useState(0);
  const [filter, setFilter] = useState({ resultPerPage: 10 });
  const [filterData, setFilterData] = useState({});
  const [filteredSearch, setFilteredSearch] = useState([]);
  const [page, setPage] = useState(1);

  //Buyers Variables
  const [buyersdata, setbuyersdata] = useState([]);
  const [buyersCount, setBuyersCount] = useState(0);
  const [buyersrefresh, setbuyersRefresh] = useState(0);
  const [buyersfilter, setbuyersFilter] = useState({ resultPerPage: 10 });
  const [buyersfilterData, setbuyersFilterData] = useState({});
  const [buyersfilteredSearch, setbuyersFilteredSearch] = useState([]);
  const [buyerspage, setbuyersPage] = useState(1);

  //Tasks Variables
  const [tasksdata, settasksdata] = useState([]);
  const [tasksCount, settasksCount] = useState(0);
  const [tasksrefresh, settasksRefresh] = useState(0);
  const [tasksfilter, settasksFilter] = useState({ resultPerPage: 10 });
  const [tasksfilterData, settasksFilterData] = useState({});
  const [tasksfilteredSearch, settasksFilteredSearch] = useState([]);
  const [taskspage, settasksPage] = useState(1);

  //HS_CODES Variables
  const [hscodesdata, sethscodesdata] = useState([]);
  const [hscodesCount, sethscodesCount] = useState(0);
  const [hscodesrefresh, sethscodesRefresh] = useState(0);
  const [hscodesfilter, sethscodesFilter] = useState({ resultPerPage: 10 });
  const [hscodesfilterData, sethscodesFilterData] = useState({});
  const [hscodesfilteredSearch, sethscodesFilteredSearch] = useState([]);
  const [hscodespage, sethscodesPage] = useState(1);
  const [addmoreContacts, setAddMoreContacts] = useState(false);
  const [isEditContact, setIsEditContact] = useState({
    isEdit: false,
    _id: "",
  });
  const [datas, setdata] = useState({});
  const [errors, setErrors] = useState({});
  const [countrydata, setCountrydata] = useState([]);
  const [HSNExpand, setHSNExpand] = useState(null);
  const [ProductExpand, setProductExpand] = useState(null);
  const [overallbuyersdata, setbuyersoveralldata] = useState([]);
  const userPermissionsForSubAdmin = JSON.parse(
    userTokenDetails.UserAccessPermission || "{}"
  );
  const [contactstable, setcontactstable] = useState([]);
  const [getdetails, setdetails] = useState({});
  const [showfetch, setshowfetch] = useState(true)

  const formatdataforcontactstable = (data) => {
    let tableData = [];
    let row = [];
    data?.forEach((key, index) => {
      row[0] = key["Contact Person"] ? key["Contact Person"] : "-";
      row[1] = key["Designation"] ? key["Designation"] : "-";
      row[2] = key["Contact Number"] ? key["Contact Number"] : "-";
      row[3] = key["Email ID"] ? key["Email ID"] : "-";
      row[4] = key["Action"] ? key["Action"] : "-";
      row[5] = (
        <div className="d-flex gap-2">
          <img
            src="assets/images/edit-icon.svg"
            height={20}
            width={20}
            onClick={() => {
              setdata({
                ...data,
                contactNo: key["Contact Number"],
                contact_person: key["Contact Person"],
                department: key["Department"],
                designation: key["Designation"],
                email_id: key["Email ID"],
              });
              setAddMoreContacts(true);
              setIsEditContact({
                isEdit: true,
                _id: key._id,
              });
            }}
          />
          <img
            src="assets/images/downloadBu.svg"
            height={20}
            width={20}
            onClick={() => {
              ExportExcel([key], "Contact_details");
            }}
          />
        </div>
      );
      tableData.push(row);
      row = [];
    });
    return tableData;
  };
  useEffect(() => {
    getContactDetailsByName();
  }, []);

  useEffect(() => {
    const fetchData = () => {
      console.log("hello karza");
      const exporterName = data.EXPORTER_NAME;
      console.log(exporterName, "expname");
      setShowLoader(true);
      call("POST", "getTraderfromKarza", {
        exporterName: exporterName,
      })
        .then((response) => {
          setShowLoader(false);
          setdetails(response);
          setshowfetch(false)
          console.log(response, "ressssspppoonnsseee"); // Log the response data
        })
        .catch((error) => {
          setShowLoader(false);
          console.error("Error fetching data:", error);
        });
    };

    fetchData();
  }, [refresh]);

  console.log(getdetails, "getdetailssssssssssssssssssssssss-----------------")


  const handleFetchData = () => {
    console.log("hello karza");
    const exporterName = data.EXPORTER_NAME;
    console.log(exporterName, "expname");
    setShowLoader(true);
    call("POST", "getTraderDetailsFromKarzaApi", {
      exporterName: exporterName,
    })
      .then((response) => {
        setShowLoader(false);
        console.log(response, "response")
        setdetails(response[0]);
        call("POST", "getTraderfromKarza", {
          exporterName: exporterName,
        })
          .then((response) => {
            setShowLoader(false);
            setdetails(response);
            setshowfetch(false)
            setRefresh(refresh + 1)
            console.log(response, "ressssspppoonnsseee"); // Log the response data
          })

        setshowfetch(false)
        console.log(response, "ressssspppoonnsseee"); // Log the response data
      })
      .catch((error) => {
        setShowLoader(false);
        setRefresh(refresh + 1)
        console.error("Error fetching data:", error);
      });
  };

  const getContactDetailsByName = () => {
    setShowLoader(true);
    call("POST", "getContactDetailsByName", {
      EXPORTER_NAME: data.EXPORTER_NAME,
    })
      .then((result) => {
        setShowLoader(false);
        setcontactstable(formatdataforcontactstable(result.EXTRA_DETAILS));
      })
      .catch((e) => {
        setShowLoader(false);
      });
  };
  useEffect(() => {
    if (data.HS_CODES) {
      const mappedHS = data.HS_CODES.map((item) => item.HS_CODES.slice(0, 2));
      const uniqueHS = [...new Set(mappedHS)];
      sethsnCodes(uniqueHS.sort());
    }
  }, [data]);

  useEffect(() => {
    Object.keys(hsExpanded)
      .filter((item) => hsExpanded[item])
      .forEach((hsCode) => {
        if (!graphTableMode[`ExpHis_${hsCode}`]) {
          let columndata = [{ name: "Date" }];
          let tabledata = [];
          if (tab[hsCode] === "Values") {
            for (
              let i = 0;
              i <= exportchartconfig?.[`config_${hsCode}`]?.length - 1;
              i++
            ) {
              let element = exportchartconfig?.[`config_${hsCode}`][i];
              columndata.push({
                name: element.dataKey?.split("_")[0],
              });
              if (
                exportHistory?.[`graph_${hsCode}`] &&
                exportHistory?.[`graph_${hsCode}`]?.length
              ) {
                const item = exportHistory?.[`graph_${hsCode}`][i];
                tabledata.push([item?.label]);
              }
            }
            setGraphColumns({
              ...graphColumns,
              [`expHistory_${hsCode}`]: columndata,
            });
            let resarray = [];
            let totalObj = ["Total"];
            for (
              let index = 0;
              index < exportHistory?.[`graph_${hsCode}`]?.length;
              index++
            ) {
              const element = exportHistory?.[`graph_${hsCode}`][index];
              let tempArray = [];
              tempArray.push(
                getXAxisDateFormat(
                  graphConfiguration?.[`ExportHistoryTo_${hsCode}`],
                  graphConfiguration?.[`ExportHistoryFrom_${hsCode}`],
                  element.label
                )
              );
              for (let j = 1; j < columndata.length; j++) {
                const item = columndata[j];
                tempArray.push(
                  element[`${item.name}_VALUE`]
                    ? `$ ${Intl.NumberFormat("en", {
                      notation: "compact",
                    }).format(element[`${item.name}_VALUE`])}`
                    : "$ 0"
                );
                if (element[`${item.name}_VALUE`]) {
                  totalObj[j] = totalObj[j]
                    ? totalObj[j] + element[`${item.name}_VALUE`]
                    : element[`${item.name}_VALUE`];
                }
              }
              resarray.push(tempArray);
            }
            resarray.push(
              totalObj.map((item, index) =>
                index === 0
                  ? item
                  : `$ ${Intl.NumberFormat("en", {
                    notation: "compact",
                  }).format(item)}`
              )
            );
            setexportHistoryTableData({
              ...exportHistoryTableData,
              [hsCode]: resarray,
            });
          } else {
            for (
              let i = 0;
              i <= quantitychartconfig?.[`quantconfig_${hsCode}`]?.length - 1;
              i++
            ) {
              let element = quantitychartconfig?.[`quantconfig_${hsCode}`]?.[i];
              columndata.push({
                name: element.dataKey?.split("_")[0],
              });
            }
            setGraphColumns({
              ...graphColumns,
              [`expHistory_${hsCode}`]: columndata,
            });
            let resarray = [];
            let totalObj = ["Total"];
            for (
              let index = 0;
              index < exportHistory?.[`graph_${hsCode}`]?.length;
              index++
            ) {
              const element = exportHistory?.[`graph_${hsCode}`]?.[index];
              let tempArray = [];
              tempArray.push(
                getXAxisDateFormat(
                  graphConfiguration?.[`ExportHistoryTo_${hsCode}`],
                  graphConfiguration?.[`ExportHistoryFrom_${hsCode}`],
                  element.label
                )
              );
              for (let j = 1; j < columndata.length; j++) {
                const item = columndata[j];
                tempArray.push(
                  element[`${item.name}_QUANTITY`]
                    ? element[`${item.name}_QUANTITY`]
                    : "-"
                );
                if (element[`${item.name}_QUANTITY`]) {
                  totalObj[j] = totalObj[j]
                    ? totalObj[j] + element[`${item.name}_QUANTITY`]
                    : element[`${item.name}_QUANTITY`];
                }
              }
              resarray.push(tempArray);
            }
            resarray.push(
              totalObj.map((item, index) =>
                index === 0 ? item : item?.toFixed(2)
              )
            );
            setexportHistoryTableData({
              ...exportHistoryTableData,
              [hsCode]: resarray,
            });
          }
        }
      });
  }, [graphTableMode, tab, hsExpanded]);
  useEffect(() => {
    Object.keys(hsExpanded)
      .filter((item) => hsExpanded[item])
      .forEach((hsCode) => {
        if (!graphTableMode[`priceHis_${hsCode}`]) {
          let columndata = [{ name: "Date" }];
          let tabledata = [];
          for (
            let i = 0;
            i <= chartconfig?.[`config_${hsCode}`]?.length - 1;
            i++
          ) {
            let element = chartconfig?.[`config_${hsCode}`]?.[i];
            columndata.push({
              name: element.dataKey,
            });
            if (
              graphdata?.[`graph_${hsCode}`] &&
              graphdata?.[`graph_${hsCode}`]?.length
            ) {
              const item = graphdata?.[`graph_${hsCode}`][i];
              tabledata.push([item?.label]);
            }
          }
          setGraphColumns({
            ...graphColumns,
            [`price_his${hsCode}`]: columndata,
          });
          let resarray = [];
          let totalObj = ["Total"];
          for (
            let index = 0;
            index < graphdata?.[`graph_${hsCode}`]?.length;
            index++
          ) {
            const element = graphdata?.[`graph_${hsCode}`]?.[index];
            let tempArray = [];
            tempArray.push(
              getXAxisDateFormat(
                graphConfiguration[`priceHistoryTo_${hsCode}`],
                graphConfiguration[`priceHistoryFrom_${hsCode}`],
                element.label
              )
            );
            for (let j = 1; j < columndata.length; j++) {
              const item = columndata[j];
              tempArray.push(
                element[`${item.name}`] ? `$ ${element[item.name]} ` : "-"
              );
              if (element[`${item.name}`]) {
                totalObj[j] = totalObj[j]
                  ? parseFloat(totalObj[j] + element[`${item.name}`])
                  : parseFloat(element[`${item.name}`]);
              }
            }
            resarray.push(tempArray);
          }
          resarray.push(
            totalObj.map((item, index) =>
              index === 0
                ? item
                : "$ " +
                (item / graphdata?.[`graph_${hsCode}`]?.length)?.toFixed(2)
            )
          );
          setPriceHistoryTableData({
            ...priceHistoryTableData,
            [hsCode]: resarray,
          });
        }
      });
  }, [graphTableMode, hsExpanded]);
  async function handleCountriesPOPUP(itemData) {
    setShowLoader(true);
    try {
      let apiResp = await call("POST", "getTopCountries", {
        EXPORTER_NAME: data.EXPORTER_NAME,
      });
      // console.log("getTransactionHistoryForInvoiceLimit api resp====>", itemData, apiResp);
      setShowLoader(false);
      togglecountriesPopup({ show: true, data: apiResp });
    } catch (e) {
      setShowLoader(false);
    }
  }
  const addExtraContactDetails = () => {
    let errors = {};
    if (
      !datas.department &&
      !datas.contact_person &&
      !datas.designation &&
      !datas.contactNo &&
      !datas.email_id
    ) {
      errors.department = "Department cannot be empty";
      errors.contact_person = "Contact Person cannot be empty";
      errors.designation = "Designation Cannot be empty";
      errors.contactNo = "Contact Number cannot be empty";
      errors.email_id = "Email ID Cannot be empty";
    }
    if (!isEmpty(errors)) {
      setErrors(errors);
    } else {
      setShowLoader(true);
      let reqObj = {
        EXPORTER_CODE: data.EXPORTER_CODE,
        isUpdate: isEditContact.isEdit,
        contactObject: {
          Department: datas.department,
          "Contact Person": datas.contact_person,
          Designation: datas.designation,
          "Contact Number": datas.contactNo,
          "Email ID": datas.email_id,
          isPrimary: datas.primaryDetails,
          _id: isEditContact._id,
        },
      };
      call("POST", "addExtraContactDetails", reqObj)
        .then((result) => {
          toastDisplay(result, "success");
          setShowLoader(false);
          setAddMoreContacts(false);
          setdata({
            ...data,
            contactNo: "",
            contact_person: "",
            department: "",
            designation: "",
            email_id: "",
          });
          getContactDetailsByName();
        })
        .catch((e) => {
          toastDisplay(e, "error");
          setShowLoader(false);
        });
    }
  };
  async function handleBuyersPOPUP(itemData) {
    setShowLoader(true);
    try {
      let apiResp = await call("POST", "getTopBuyers", {
        EXPORTER_NAME: data.EXPORTER_NAME,
        EXPORTER_COUNTRY: data.EXPORTER_COUNTRY,
        HS_CODE: itemData.HS_CODE,
      });
      // console.log("getTransactionHistoryForInvoiceLimit api resp====>", itemData, apiResp);
      setShowLoader(false);
      togglebuyersPopup({ show: true, data: apiResp });
    } catch (e) {
      setShowLoader(false);
    }
  }
  const handleAccordianClick = (index) => {
    setActiveIndex(index === activeIndex ? null : index);
  };
  const updateLeadAssignedTo = (LeadAssignedObj, EXPORTER_CODE) => {
    setShowLoader(true);
    call("POST", "AssignMasterDataTask", { LeadAssignedObj, EXPORTER_CODE })
      .then((result) => {
        toastDisplay("Lead updated", "success");
        setShowLoader(false);
      })
      .catch((e) => {
        setShowLoader(false);
        toastDisplay(
          "Failed to assign lead to " + LeadAssignedObj.contact_person,
          "error"
        );
      });
  };
  useEffect(() => {
    if (
      userPermissionsForSubAdmin.mainAdmin ||
      userPermissionsForSubAdmin?.["Assign Task"]
    ) {
      call("POST", "getSubAdminUser", {})
        .then((res) => {
          setSalesPerson(res.data);
        })
        .catch((err) => { });
    }
    axios.get(platformBackendUrl + "/getallCountry").then((result) => {
      if (result.data.message && result.data.message.length) {
        setCountrydata(result.data.message);
      }
    });
  }, []);
  const handleGraphConfigurationChange = async (event) => {
    if (event.persist) {
      event.persist();
    }
    setGraphConfiguration({
      ...graphConfiguration,
      [event.target.name]: event.target.value,
    });
  };
  const getShipmentsTable = () => {
    console.log("EXPORTER_NAME", data);
    setShowLoader(true);
    let reqObj = {
      EXPORTER_NAME: data.EXPORTER_NAME,
      EXPORTER_COUNTRY: data.EXPORTER_COUNTRY,
      ...filter,
      currentPage: page,
      resultPerPage: filter.resultPerPage,
    };
    call("POST", "getShipmentsTableV2", reqObj)
      .then((result) => {
        setShipmentdata(formatDataForTable(result.data));
        setShipmentCount(result.count_data);
        setShowLoader(false);
      })
      .catch((e) => {
        console.log("error in shipment API");
        setShowLoader(false);
      });
  };
  useEffect(() => {
    getShipmentsTableFilters();
  }, []);
  const getShipmentsTableFilters = () => {
    call("POST", "getShipmentsTableFiltersV2", {
      EXPORTER_NAME: data.EXPORTER_NAME,
      EXPORTER_COUNTRY: data.EXPORTER_COUNTRY,
    })
      .then((result) => {
        setFilterData(result);
      })
      .catch((e) => {
        console.log("error in getShipmentsTableFilters", e);
      });
  };
  useEffect(() => {
    getShipmentsTable();
  }, [refresh, page, filterData]);
  function formatDataForTable(data) {
    let tableData = [];
    let row = [];
    data.forEach((key, index) => {
      row[0] = moment(key.DATE).format("DD-MM-YYYY");
      row[1] =
        key.CONSIGNEE_NAME && key.CONSIGNEE_NAME.length > 60
          ? key.CONSIGNEE_NAME.slice(0, 60) + "..."
          : key.CONSIGNEE_NAME;
      row[2] = key.TOTAL_GROSS_WEIGHT + " " + key.UNIT;
      row[3] =
        key.PRODUCT_TYPE && key.PRODUCT_TYPE.length > 60
          ? key.PRODUCT_TYPE.slice(0, 60) + "..."
          : key.PRODUCT_TYPE;
      row[4] = key.HS_CODE;
      row[5] = key.INDIAN_PORT;
      row[6] = key.DESTINATION_PORT;

      tableData.push(row);
      row = [];
    });
    return tableData;
  }

  const getBuyerListCRM = () => {
    setShowLoader(true);
    let reqObj = {
      EXPORTER_NAME: data.EXPORTER_NAME,
      EXPORTER_COUNTRY: data.EXPORTER_COUNTRY,
      buyers: data.BUYERS,
      ...buyersfilter,
      currentPage: buyerspage,
      resultPerPage: buyersfilter.resultPerPage,
    };
    call("POST", "getBuyerListCRMV2", reqObj)
      .then((result) => {
        setbuyersdata(formatDataForBuyersTable(result.message));
        setbuyersoveralldata(result.message);
        setBuyersCount(result.total_records);
        setShowLoader(false);
      })
      .catch((e) => {
        console.log("error in getBuyerListCRM API");
        setShowLoader(false);
      });
  };
  useEffect(() => {
    getBuyerListCRM();
  }, [buyersrefresh, buyerspage, buyersfilterData]);
  function formatDataForBuyersTable(data) {
    let tableData = [];
    let row = [];
    data.forEach((key, index) => {
      const slicedHS =
        HSNExpand === index
          ? key?.HSN_CODES || []
          : key?.HSN_CODES?.slice(0, 2) || [];
      const slicedProducts =
        ProductExpand === index
          ? key?.PRODUCT_TYPE || []
          : key?.PRODUCT_TYPE?.slice(0, 2) || [];
      row[0] = (
        <label
          className="cursor"
          onClick={() => {
            localStorage.setItem(
              "ttvBuyerInfo",
              JSON.stringify({
                _id: key.CONSIGNEE_NAME,
                purchased: true,
                isFromExporter: true,
              })
            );
            window.open(platformURL + `/userDetail?type=buyer`, "_blank");
          }}
        >
          {key.CONSIGNEE_NAME && key.CONSIGNEE_NAME.length > 60
            ? key.CONSIGNEE_NAME.slice(0, 60) + "..."
            : key.CONSIGNEE_NAME}
        </label>
      );
      row[1] = key.TOTAL_SHIPMENTS;
      row[2] = (
        <div>
          <ul className="py-0 pl-3">
            {slicedProducts?.map((item) => {
              return (
                <li>
                  <div>{item}</div>
                </li>
              );
            })}
          </ul>
          {key?.PRODUCT_TYPE?.length > 2 && (
            <label
              className="font-size-12 font-wt-600 text-color1 cursor ml-1"
              onClick={() =>
                setProductExpand(ProductExpand === index ? null : index)
              }
            >
              {ProductExpand === index ? "View Less" : "View More"}
            </label>
          )}
        </div>
      );
      row[3] = (
        <div>
          <div className="flex-row">
            {slicedHS
              ? slicedHS.map((item, index) => {
                return (
                  <label className="bg-color1 p-1  border-radius-5">
                    {item?.slice(0, 8)}
                  </label>
                );
              })
              : "NA"}
          </div>
          {key?.HSN_CODES?.length > 2 && (
            <label
              className="font-size-12 font-wt-600 text-color1 cursor ml-1"
              onClick={() => setHSNExpand(HSNExpand === index ? null : index)}
            >
              {HSNExpand === index ? "View Less" : "View More"}
            </label>
          )}
        </div>
      );
      row[4] = key.FOB
        ? "$ " +
        Intl.NumberFormat("en", { notation: "compact" }).format(key.FOB)
        : "";
      row[5] = key.DESTINATION_COUNTRY;

      tableData.push(row);
      row = [];
    });
    return tableData;
  }
  useEffect(() => {
    setbuyersdata(formatDataForBuyersTable(overallbuyersdata));
  }, [HSNExpand, ProductExpand]);
  const handleChange = async (event) => {
    if (event.persist) {
      event.persist();
    }

    setdata({ ...datas, [event.target.name]: event.target.value });
    setErrors({ ...errors, [event.target.name]: "" });
  };
  const getTaskListCRM = () => {
    setShowLoader(true);
    let reqObj = {
      ttvExporterCode: data.EXPORTER_CODE,
      ...tasksfilter,
      currentPage: taskspage,
      resultPerPage: tasksfilter.resultPerPage,
    };
    call("POST", "getTasksListCRM", reqObj)
      .then((result) => {
        settasksdata(formatDataFortasksTable(result.message));
        settasksCount(result.total_records);
        setShowLoader(false);
      })
      .catch((e) => {
        console.log("error in getBuyerListCRM API");
        setShowLoader(false);
      });
  };
  useEffect(() => {
    getTaskListCRM();
  }, [tasksrefresh, taskspage, tasksfilterData]);
  function formatDataFortasksTable(data) {
    let tableData = [];
    let row = [];
    data.forEach((key, index) => {
      row[0] = key.EVENT_TIME
        ? moment(key.EVENT_TIME).format("DD-MM-YYYY")
        : "NA";
      row[1] = key.EVENT_STATUS ? key.EVENT_STATUS?.split("(")[0] : "NA";
      row[2] = key.EVENT_TYPE;
      row[3] = key.EXPORTER_NAME;
      row[4] = key.CREATOR
        ? `${key.CREATOR?.[0]?.contact_person} (${key.CREATOR?.[0]?.email_id})`
        : "NA";
      row[5] = (
        <span
          className="font-wt-500"
          dangerouslySetInnerHTML={{
            __html: key.REMARK
              ? key.REMARK.length > 60
                ? key.REMARK.slice(0, 60) + "......."
                : key.REMARK
              : "",
          }}
        ></span>
      );
      tableData.push(row);
      row = [];
    });
    return tableData;
  }

  const getHSNListCRM = () => {
    setShowLoader(true);
    let reqObj = {
      EXPORTER_NAME: data.EXPORTER_NAME,
      EXPORTER_COUNTRY: data.EXPORTER_COUNTRY,
      ...hscodesfilter,
      currentPage: hscodespage,
      resultPerPage: hscodesfilter.resultPerPage,
    };
    call("POST", "getHSNListCRMV2", reqObj)
      .then((result) => {
        sethscodesdata(formatDataForhscodesTable(result.message));
        sethscodesCount(result.total_records);
        setShowLoader(false);
      })
      .catch((e) => {
        console.log("error in getBuyerListCRM API");
        setShowLoader(false);
      });
  };
  useEffect(() => {
    getHSNListCRM();
  }, [hscodesrefresh, hscodespage, hscodesfilterData]);
  function formatDataForhscodesTable(data) {
    let tableData = [];
    let row = [];
    data.forEach((key, index) => {
      row[0] = key.HS_CODE ? key.HS_CODE : "NA";
      row[1] = key.SUB_CODES ? (
        <span
          className="cursor"
          onClick={() =>
            setHSDetails({
              show: true,
              data: data,
              selectedHS: key.HS_CODE,
            })
          }
        >
          {key.SUB_CODES}
        </span>
      ) : (
        0
      );
      row[2] = key.BUYERS ? (
        <span className="cursor" onClick={() => handleBuyersPOPUP(key)}>
          {key.BUYERS}
        </span>
      ) : (
        0
      );
      row[3] = key.TOTAL_SHIPMENTS ? key.TOTAL_SHIPMENTS : 0;
      row[4] =
        key.FOB != null || key.FOB != undefined
          ? `$ ${Intl.NumberFormat("en", { notation: "compact" }).format(
            key.FOB
          )}` || "NA"
          : "NA";
      row[5] =
        key.PRODUCT_DESCRIPTION && key.PRODUCT_DESCRIPTION.length > 60 ? (
          <span title={key.PRODUCT_DESCRIPTION}>
            {key.PRODUCT_DESCRIPTION.slice(0, 60) + "..."}
          </span>
        ) : (
          key.PRODUCT_DESCRIPTION
        );
      row[6] = (
        <ul
          className="py-0 pl-3 cursor"
          onClick={() => handleCountriesPOPUP(key)}
        >
          {key?.TOP_COUNTRIES?.slice(0, 2)?.map((item) => {
            return (
              <li>
                <div>{item.DESTINATION_COUNTRY}</div>
              </li>
            );
          })}
        </ul>
      );
      tableData.push(row);
      row = [];
    });
    return tableData;
  }
  const getXAxisDateFormat = (toDate, FromDate, value) => {
    let countForMonths = moment(toDate).diff(FromDate, "month");
    let dateFormat = "";
    if (countForMonths > 12) {
      dateFormat = value;
    }
    if (countForMonths > 3) {
      console.log("dartataaadsasdsdasad", moment(value).format("MMM YYYY"));
      dateFormat = moment(value).format("MMM YYYY");
    } else if (countForMonths === 1) {
      dateFormat = moment(value).format("DD MMM YYYY");
    } else {
      dateFormat = value;
    }
    return dateFormat;
  };
  const getHSTrendGraph = () => {
    Object.keys(hsExpanded)
      .filter((item) => hsExpanded[item])
      .forEach((element) => {
        setShowLoader(true);
        call("POST", "getHSTrendGraphV2", {
          priceHistoryFrom: graphConfiguration[`priceHistoryFrom_${element}`],
          priceHistoryTo: graphConfiguration[`priceHistoryTo_${element}`],
          EXPORTER_NAME: data.EXPORTER_NAME,
          EXPORTER_COUNTRY: data.EXPORTER_COUNTRY,
          selectedHS: element,
        })
          .then((result) => {
            setgraphdata({
              ...graphdataRef.current,
              [`graph_${element}`]: result.message,
            });
            graphdataRef.current = {
              ...graphdataRef.current,
              [`graph_${element}`]: result.message,
            };
            setChartConfig({
              ...chartconfigRef.current,
              [`config_${element}`]: result.chartconfig,
            });
            chartconfigRef.current = {
              ...chartconfigRef.current,
              [`config_${element}`]: result.chartconfig,
            };
            setShowLoader(false);
          })
          .catch((e) => {
            setShowLoader(false);
            console.log("error in HS", e);
          });
      });
  };
  const getHSExportTrendGraph = () => {
    Object.keys(hsExpanded)
      .filter((item) => hsExpanded[item])
      .forEach((element) => {
        call("POST", "getHSExportTrendGraphV2", {
          priceHistoryFrom: graphConfiguration[`ExportHistoryFrom_${element}`],
          priceHistoryTo: graphConfiguration[`ExportHistoryTo_${element}`],
          EXPORTER_NAME: data.EXPORTER_NAME,
          EXPORTER_COUNTRY: data.EXPORTER_COUNTRY,
          selectedHS: HSDetails.selectedHS,
        })
          .then((result) => {
            setexportHistory({
              ...exportHistoryRef.current,
              [`graph_${element}`]: result.message,
            });
            exportHistoryRef.current = {
              ...exportHistoryRef.current,
              [`graph_${element}`]: result.message,
            };
            setexportchartconfig({
              ...exportchartconfigRef.current,
              [`config_${element}`]: result.chartconfig,
            });
            exportchartconfigRef.current = {
              ...exportchartconfigRef.current,
              [`config_${element}`]: result.chartconfig,
            };
            setquantitychartconfig({
              ...quantitychartconfigRef.current,
              [`quantconfig_${element}`]: result.quantitychartconfig,
            });
            exportchartconfigRef.current = {
              ...quantitychartconfigRef.current,
              [`quantconfig_${element}`]: result.quantitychartconfig,
            };
          })
          .catch((e) => {
            console.log("error in HS", e);
          });
      });
  };
  useEffect(() => {
    setHSExpanded({
      [HSDetails.selectedHS]: true,
    });
    let graphConfigurationObj = {};
    let countriesFilterObj = {};
    let lanesFilterObj = {};
    let shipmentsFromFilterObj = {};
    let shipmentsToFilterObj = {};
    let hstableObj = {};
    let tabObj = {};
    HSDetails.data.forEach((item) => {
      graphConfigurationObj[`ExportHistoryTo_${item.HS_CODE}`] = todayDateObj
        .clone()
        .format("YYYY-MM-DD");
      graphConfigurationObj[`ExportHistoryFrom_${item.HS_CODE}`] =
        lastMonthDateObj.clone().format("YYYY-MM-DD");
      graphConfigurationObj[`priceHistoryFrom_${item.HS_CODE}`] =
        lastMonthDateObj.clone().format("YYYY-MM-DD");
      graphConfigurationObj[`priceHistoryTo_${item.HS_CODE}`] = todayDateObj
        .clone()
        .format("YYYY-MM-DD");

      countriesFilterObj[item.HS_CODE] = "2022-2023";
      lanesFilterObj[item.HS_CODE] = "2022-2023";
      shipmentsFromFilterObj[item.HS_CODE] = "2022-2023";
      shipmentsToFilterObj[item.HS_CODE] = "2022-2023";
      hstableObj[`ExpHis_${item.HS_CODE}`] = true;
      hstableObj[`priceHis_${item.HS_CODE}`] = true;
      tabObj[item.HS_CODE] = "Values";
    });
    setGraphConfiguration(graphConfigurationObj);
    setCountriesFilter(countriesFilterObj);
    setLanesFilter(lanesFilterObj);
    setShipmentsFromFilter(shipmentsFromFilterObj);
    setShipmentsToFilter(shipmentsToFilterObj);
    setGraphTableMode(hstableObj);
    setTab(tabObj);
  }, [HSDetails.selectedHS]);
  useEffect(() => {
    if (graphConfiguration) {
      getHSTrendGraph();
      getHSExportTrendGraph();
    }
  }, [graphConfiguration, hsExpanded]);

  const getshipmentcountrychart = () => {
    Object.keys(hsExpanded)
      .filter((item) => hsExpanded[item])
      .forEach((element) => {
        const dateRange = getFiscalYearDates(
          countriesFilter[element]?.split("-")?.[0]
        );
        call("POST", "getshipmentcountriesV2", {
          dateFrom: dateRange.startDate,
          dateTo: dateRange.endDate,
          EXPORTER_NAME: data.EXPORTER_NAME,
          EXPORTER_COUNTRY: data.EXPORTER_COUNTRY,
          selectedHS: element,
        })
          .then((result) => {
            setCountriesChart({
              ...countriesChartRef.current,
              [`countries_${element}`]: result,
            });
            countriesChartRef.current = {
              ...countriesChartRef.current,
              [`countries_${element}`]: result,
            };
          })
          .catch((e) => {
            console.log("error in HS", e);
          });
      });
  };
  const getSourceDestinationCount = () => {
    Object.keys(hsExpanded)
      .filter((item) => hsExpanded[item])
      .forEach((element) => {
        const dateRange = getFiscalYearDates(
          lanesFilter[element]?.split("-")?.[0]
        );

        call("POST", "getSourceDestinationCountV2", {
          dateFrom: dateRange.startDate,
          dateTo: dateRange.endDate,
          EXPORTER_NAME: data.EXPORTER_NAME,
          EXPORTER_COUNTRY: data.EXPORTER_COUNTRY,
          selectedHS: element,
        })
          .then((result) => {
            setlanesChart({
              ...lanesChartRef.current,
              [`lanes_${element}`]: result,
            });
            lanesChartRef.current = {
              ...lanesChartRef.current,
              [`lanes_${element}`]: result,
            };
          })
          .catch((e) => {
            console.log("error in HS", e);
          });
      });
  };
  const getshipmentsoriginportchart = () => {
    Object.keys(hsExpanded)
      .filter((item) => hsExpanded[item])
      .forEach((element) => {
        const dateRange = getFiscalYearDates(
          shipmentsFromFilter[element]?.split("-")?.[0]
        );

        call("POST", "gettoporiginportsV2", {
          dateFrom: dateRange.startDate,
          dateTo: dateRange.endDate,
          EXPORTER_NAME: data.EXPORTER_NAME,
          EXPORTER_COUNTRY: data.EXPORTER_COUNTRY,
          selectedHS: element,
        })
          .then((result) => {
            setshipmentsFromChart({
              ...shipmentsFromChartRef.current,
              [`source_port_${element}`]: result,
            });
            shipmentsFromChartRef.current = {
              ...shipmentsFromChartRef.current,
              [`source_port_${element}`]: result,
            };
          })
          .catch((e) => {
            console.log("error in HS", e);
          });
      });
  };
  const getshipmentsportchart = () => {
    Object.keys(hsExpanded)
      .filter((item) => hsExpanded[item])
      .forEach((element) => {
        const dateRange = getFiscalYearDates(
          shipmentsToFilter[element]?.split("-")?.[0]
        );

        call("POST", "gettopportsshipmentsV2", {
          dateFrom: dateRange.startDate,
          dateTo: dateRange.endDate,
          EXPORTER_NAME: data.EXPORTER_NAME,
          EXPORTER_COUNTRY: data.EXPORTER_COUNTRY,
          selectedHS: element,
        })
          .then((result) => {
            setshipmentsToChart({
              ...shipmentsToChartRef.current,
              [`destination_port_${element}`]: result,
            });
            shipmentsToChartRef.current = {
              ...shipmentsToChartRef.current,
              [`destination_port_${element}`]: result,
            };
          })
          .catch((e) => {
            console.log("error in HS", e);
          });
      });
  };
  useEffect(() => {
    getshipmentcountrychart();
  }, [hsExpanded, countriesFilter]);
  useEffect(() => {
    getSourceDestinationCount();
  }, [hsExpanded, lanesFilter]);
  useEffect(() => {
    getshipmentsoriginportchart();
  }, [hsExpanded, shipmentsFromFilter]);
  useEffect(() => {
    getshipmentsportchart();
  }, [hsExpanded, shipmentsToFilter]);
  return (
    <>
      {showLoader && (
        <div className="loading-overlay">
          <span>
            <img
              className=""
              src="assets/images/loader.gif"
              alt="description"
            />
          </span>
        </div>
      )}
      <ToastContainer
        position="bottom-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnVisibilityChange
        draggable
        pauseOnHover
      />
      <div
        className={`modal fade ${countriesPopup.show && "show"}`}
        style={
          countriesPopup.show ? { display: "block", zIndex: "100001" } : {}
        }
      >
        <div className="modal-dialog modal-md mr-0 my-0">
          <div className="modal-content submitmodal pb-4">
            <div className="modal-header border-0">
              <div className="w-100 d-flex align-items-center justify-content-between">
                <label className="font-size-16 font-wt-600 text-color-value mx-3">
                  Top Countries BY FOB
                </label>
                <div className="modal-header border-0">
                  <button
                    type="button"
                    className="btn-close"
                    aria-label="Close"
                    onClick={() =>
                      togglecountriesPopup({ show: false, data: [] })
                    }
                  ></button>
                </div>
              </div>
            </div>

            <div className="modal-body px-4">
              {countriesPopup.data.length
                ? countriesPopup.data.map((item, index) => {
                  return (
                    <div className="d-flex flex-row ml-3">
                      <div className="progressBarContainer2">
                        <div className="progressBarInnerCircle"></div>
                      </div>
                      <div className="pl-4 pt-4 mt-2">
                        <p className="font-size-14 text-color1 font-wt-500 mb-0">
                          {item["_id"] ? item["_id"] : "NA"}
                          <span className="font-size-14 text-color-label font-wt-500 mb-0">{` ${item.total_shipments} `}</span>
                          <span>
                            <img
                              src="assets/images/arrow.png"
                              className="cursor"
                              onClick={() => handleAccordianClick(index)}
                            />
                          </span>
                        </p>
                        {activeIndex === index && (
                          <div>
                            <p className="mb-0 font-size-14">Buyers</p>
                            <ol
                              type="1"
                              className="py-0 pl-3 cursor"
                              onClick={() => handleCountriesPOPUP(item)}
                              style={{ listStyle: "decimal" }}
                            >
                              {item?.top_buyers?.map((item) => {
                                return (
                                  <li>
                                    <div className="font-size-14">
                                      {item.buyer_name +
                                        " - " +
                                        item.shipment_count}
                                    </div>
                                  </li>
                                );
                              })}
                            </ol>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
                : null}
            </div>
          </div>
        </div>
      </div>
      <div
        className={`modal fade ${buyersPopup.show && "show"}`}
        style={buyersPopup.show ? { display: "block", zIndex: "100001" } : {}}
      >
        <div className="modal-dialog modal-md mr-0 my-0">
          <div className="modal-content submitmodal pb-4">
            <div className="modal-header border-0">
              <div className="w-100 d-flex align-items-center justify-content-between">
                <label className="font-size-16 font-wt-600 text-color-value mx-3">
                  Top Buyers BY FOB
                </label>
                <div className="modal-header border-0">
                  <button
                    type="button"
                    className="btn-close"
                    aria-label="Close"
                    onClick={() => togglebuyersPopup({ show: false, data: [] })}
                  ></button>
                </div>
              </div>
            </div>

            <div className="modal-body px-4">
              {buyersPopup.data.length
                ? buyersPopup.data.map((item, index) => {
                  return (
                    <div className="d-flex flex-row ml-3">
                      <div className="progressBarContainer2">
                        <div className="progressBarInnerCircle"></div>
                      </div>
                      <div className="pl-4 pt-4 mt-2">
                        <p className="font-size-14 text-color1 font-wt-500 mb-0">
                          {item.CONSGINEE_NAME ? item.CONSGINEE_NAME : "NA"}
                          {/* <span className='font-size-14 text-color-label font-wt-500 mb-0'>{` ${item.total_shipments} `}</span> */}
                          <span className="font-size-14 text-color-label font-wt-700 mb-0">{` ${item.FOB
                            ? "$ " +
                            Intl.NumberFormat("en", {
                              notation: "compact",
                            }).format(item.FOB)
                            : "$ 0"
                            } `}</span>
                        </p>
                      </div>
                    </div>
                  );
                })
                : null}
            </div>
          </div>
        </div>
      </div>
      <div
        className={`modal fade ${addmoreContacts && "show"}`}
        style={addmoreContacts ? { display: "block", zIndex: "1000001" } : {}}
      >
        <div className="modal-dialog modal-md  modal-dialog-centered">
          <div className="modal-content submitmodal pb-4">
            <div className="modal-header border-0">
              <div className="w-100 d-flex align-items-center justify-content-between">
                <div className="d-flex gap-3 align-items-center">
                  <label className="font-size-14 font-wt-500 text-color-value mx-3 mb-0">{`Add New Contact`}</label>
                  <img src="assets/images/delete.png" />
                </div>

                <div className="modal-header border-0">
                  <img
                    src="assets/images/close-schedule.png"
                    className="cursor"
                    onClick={() => {
                      setAddMoreContacts(false);
                      setdata({
                        ...datas,
                        contactNo: "",
                        contact_person: "",
                        department: "",
                        designation: "",
                        email_id: "",
                      });
                      setIsEditContact({
                        isEdit: false,
                        _id: "",
                      });
                    }}
                  />
                </div>
              </div>
            </div>
            <div className="modal-body px-4">
              <div className="col-md-12 d-flex align-items-center flex-column">
                <div className="col-md-10 pt-1 ">
                  <div className="col-md-11 px-0">
                    <NewInput
                      isAstrix={true}
                      type={"text"}
                      label={"Contact Person Name"}
                      name={"contact_person"}
                      value={datas.contact_person}
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
                      value={datas.designation}
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
                      value={datas.department}
                      onChange={handleChange}
                      error={errors.department}
                    />
                  </div>
                </div>
                <div className="col-md-10 pt-1 ">
                  <div className="col-md-11 px-0">
                    <InputWithSelect
                      selectData={countrydata}
                      selectName={"phoneCode"}
                      selectValue={datas.phoneCode}
                      optionLabel={"phonecode"}
                      optionValue={"phonecode"}
                      type="number"
                      name={"contactNo"}
                      value={datas["contactNo"]}
                      onChange={handleChange}
                      label={"Conatct No."}
                      error={errors["contactNo"]}
                    />
                  </div>
                </div>
                <div className="col-md-10 pt-1 ">
                  <div className="col-md-11 px-0">
                    <NewInput
                      isAstrix={true}
                      type={"text"}
                      label={"Email ID"}
                      name={"email_id"}
                      value={datas.email_id}
                      onChange={handleChange}
                      error={errors.email_id}
                    />
                  </div>
                </div>
                <div className="col-md-10 mt-2 ">
                  <img
                    onClick={() =>
                      setdata({
                        ...datas,
                        primaryDetails: !datas.primaryDetails,
                      })
                    }
                    className="cursor mr-3"
                    src={`assets/images/${data.primaryDetails ? "checked-green" : "empty-check"
                      }.png`}
                  />
                  <label>Select as primary contact</label>
                </div>
                <div className="col-md-10 pt-1 ">
                  <button
                    onClick={addExtraContactDetails}
                    className={`mt-3 new-btn  py-2 px-2 text-white cursor`}
                  >
                    Save Contact
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="col">
        <div className="d-flex flex-row justify-content-between">
          <div className="d-flex flex-row align-items-center gap-4">
            <div className="d-flex flex-row align-items-center">
              <img
                src="assets/images/ArrowBackLeft.png"
                height={20}
                width={20}
                className="cursor mx-2"
                onClick={() => {
                  if (HSDetails.show) {
                    setHSDetails({
                      show: false,
                      data: [],
                      selectedHS: null,
                    });
                  } else {
                    goBack();
                  }
                }}
              />
              <div className="mx-2">
                <p className="font-wt-600 font-size-16 p-0 m-0">
                  {data.EXPORTER_NAME}
                </p>
              </div>
            </div>

            <div>
              <div className="d-flex flex-row align-items-center">
                <ReactCountryFlag
                  countryCode={"IN"}
                  style={{
                    width: "50px",
                    height: "50px",
                    borderRadius: "15px",
                  }}
                  svg
                />
              </div>
            </div>

            <div className="d-flex flex-row align-items-center border-left pl-4">
              <label className="font-size-13 mb-0 font-wt-600 mr-1">
                {"Task Assigned To:  "}
              </label>
              <label
                class="font-wt-500 font-size-13 cursor mb-0 text-color1"
                id="dropdownMenuButton1"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                {data.TASK_ASSIGNED_TO?.[0]?.contact_person || "-"}
                <img src="/assets/images/arrowdown.png" className="ml-2" />
              </label>
              <ul class="dropdown-menu" aria-labelledby="dropdownMenuButton1">
                {salesPerson.map((element) => {
                  return (
                    <li
                      className="dropdown-item cursor font-wt-500 "
                      onClick={() => {
                        updateLeadAssignedTo(element, data.EXPORTER_CODE);
                      }}
                    >
                      {element.contact_person}
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
          <div className="d-flex flex-row align-items-center">
            {data.TASK_DATE && (
              <label className="font-size-14 font-wt-600 mb-0">{`Last login -  ${moment(
                data.TASK_DATE
              ).format("DD/MM/YYYY hh:ss A ")}`}</label>
            )}
          </div>
        </div>
        {!HSDetails.show && (
          <div>
            <div className="card mt-4  br-1 ">
              <div>
                <div className="border-bottom">
                  <div className="d-flex flex-row align-items-center justify-content-between p-4">
                    <div className="d-flex gap-3">
                      <label className="font-size-14 font-wt-600">
                        Organisation details
                      </label>
                      <img
                        className="cursor"
                        onClick={() =>
                          setIsOrganisationExpanded(!isOrganisationExpanded)
                        }
                        src="assets/images/arrowdown.png"
                        height={20}
                        width={20}
                        style={
                          isOrganisationExpanded ? {} : { rotate: "180deg" }
                        }
                      />
                    </div>
                    <div className="d-flex gap-3">
                      <img
                        src="assets/images/edit-icon.png"
                        height={20}
                        width={20}
                      />
                      <img
                        src="assets/images/add_black_icon.png"
                        height={20}
                        width={20}
                      />
                    </div>
                  </div>
                </div>
                {isOrganisationExpanded && (
                  <div className="mt-4 row">
                    <div className="col-md-4">
                      {reviewForm.map((item) => {
                        let val = "";
                        if (item.val === "contact_number") {
                          val =
                            getContactObject(data.EXTRA_DETAILS)?.[
                            "Contact Number"
                            ] || "NA";
                        } else if (item.val === "contact_person") {
                          val =
                            getContactObject(data.EXTRA_DETAILS)?.[
                            "Contact Person"
                            ] || "NA";
                        } else {
                          val = data[item.val] || "NA";
                        }
                        let unit = item.unit
                          ? userTokenDetails?.subUserProfileDetails?.[
                          item.unit
                          ] || data[item.unit]
                          : "";
                        return (
                          <div className="col ">
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
                      })}
                    </div>
                    <div className="col-md-4">
                      <div className="col ">
                        <p className="d-flex align-items-top mb-2">
                          <span className="col-md-5 px-0 BuyerdetailsLabel">
                            {"Total Turover"}
                          </span>
                          <span className="mx-3">:</span>
                          <span className="col-md-7 BuyerdetailsDesc">
                            {data.FOB
                              ? "$ " +
                              Intl.NumberFormat("en", {
                                notation: "compact",
                              }).format(data.FOB)
                              : ""}
                          </span>
                        </p>
                      </div>
                      <div className="col ">
                        <p className="d-flex align-items-top mb-2">
                          <span className="col-md-5 px-0 BuyerdetailsLabel">
                            {"HSN Codes"}
                          </span>
                          <span className="mx-3">:</span>
                          <span className="col-md-7 BuyerdetailsDesc">
                            <div className="flex-row">
                              {hsnCodes.length
                                ? hsnCodes.map((item, index) => {
                                  return (
                                    <label className="bg-color1 p-1 mx-1 border-radius-5">
                                      {item}
                                    </label>
                                  );
                                })
                                : "NA"}
                            </div>
                          </span>
                        </p>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="col ">
                        <p className="d-flex align-items-top mb-2">
                          <span className="col-md-5 px-0 BuyerdetailsLabel">
                            {"GSTIN"}
                          </span>
                          <span className="mx-3">:</span>
                          <span className="col-md-7 BuyerdetailsDesc">
                            {"NA"}
                          </span>
                        </p>
                      </div>
                      <div className="col ">
                        <p className="d-flex align-items-top mb-2">
                          <span className="col-md-5 px-0 BuyerdetailsLabel">
                            {"IEC"}
                          </span>
                          <span className="mx-3">:</span>
                          <span className="col-md-7 BuyerdetailsDesc">
                            {data.IEC_NO ? data.IEC_NO : "NA"}
                          </span>
                        </p>
                      </div>
                      <div className="col ">
                        <p className="d-flex align-items-top mb-2">
                          <span className="col-md-5 px-0 BuyerdetailsLabel">
                            {"CIN no."}
                          </span>
                          <span className="mx-3">:</span>
                          <span className="col-md-7 BuyerdetailsDesc">
                            {data.CIN_NO ? data.CIN_NO : "NA"}
                          </span>
                        </p>
                      </div>
                      <div className="col ">
                        <p className="d-flex align-items-top mb-2">
                          <span className="col-md-5 px-0 BuyerdetailsLabel">
                            {"PAN no."}
                          </span>
                          <span className="mx-3">:</span>
                          <span className="col-md-7 BuyerdetailsDesc">
                            {data.PAN_NO ? data.PAN_NO : "NA"}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="card mt-4  br-1 ">
              <div>
                <div className="border-bottom">
                  <div className="d-flex flex-row align-items-center justify-content-between p-4">
                    <div className="d-flex gap-3">
                      <label className="font-size-14 font-wt-600">
                        Contact details
                      </label>
                      <img
                        className="cursor"
                        onClick={() => setIsContactsExpanded(!isContactDetails)}
                        src="assets/images/arrowdown.png"
                        height={20}
                        width={20}
                        style={isContactDetails ? {} : { rotate: "180deg" }}
                      />
                    </div>
                    <div className="d-flex gap-3">
                      <img
                        src="assets/images/add_black_icon.png"
                        className="cursor"
                        height={20}
                        width={20}
                        onClick={() => setAddMoreContacts(true)}
                      />
                    </div>
                  </div>
                </div>
                {isContactDetails && (
                  <div className="mt-4 row">
                    {/* {data.EXTRA_DETAILS?.map(element => {
                      return <div className='col-md-4 px-4'>
                        <label className='font-size-13 font-wt-600'>{`${element["Contact Person"] ? element["Contact Person"] : ""} ${element["Designation"] ? `(${element["Designation"]})` : ''} `}</label>
                        {reviewForm2.map((item) => {
                          let val = element[item.val] || "NA"
                          let unit = item.unit ? (userTokenDetails?.subUserProfileDetails?.[item.unit] || data[item.unit]) : ""
                          return (
                            <div className="col ">
                              <p className="d-flex align-items-top mb-2">
                                <span className="col-md-5 px-0 BuyerdetailsLabel">{item.name}</span>
                                <span className="mx-3">:</span>
                                <span className="col-md-7 BuyerdetailsDesc" >
                                  {(unit ? `${unit ? unit : ''} ` : "") + (val)}
                                </span>
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    })} */}
                    <div className="mt-4">
                      <NewTable
                        disableAction
                        columns={[
                          { name: "Name" },
                          { name: "Designation" },
                          { name: "Contact Number" },
                          { name: "Email ID" },
                          { name: "DIN" },
                          { name: "Action" },
                        ]}
                        data={contactstable}
                      />
                    </div>
                  </div>
                )}
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
                      {/* <div class="parent-containerauditor" key={index}>
                        <div class="child-containerauditor">
                          <div class="inner-childauditor">
                            Auditor Address -{" "}
                            {ele.data.auditorProfile[0].addressOfAuditors}
                          </div>
                          <div class="inner-childauditor">
                            Auditor Firm -{" "}
                            {ele.data.auditorProfile[0].categryAudtrfrm}
                          </div>
                        </div>

                        <div class="child-containerauditor">
                          <div class="inner-childauditor">
                            It Pan - {ele.data.auditorProfile[0].itPan}
                          </div>
                          <div class="inner-childauditor">
                            MemberShip Number -{" "}
                            {ele.data.auditorProfile[0].membrshpNum}
                          </div>
                        </div>
                        <div class="child-containerauditor">
                          <div class="inner-childauditor">
                            Auditor Name -{" "}
                            {ele.data.auditorProfile[0].nameOfAuditor}
                          </div>
                          <div class="inner-childauditor">
                            Name of Auditor Signing Report -{" "}
                            {
                              ele.data.auditorProfile[0]
                                .nameOfAuditorSigningReport
                            }
                          </div>
                        </div>
                        <div class="child-containerauditor">
                          <div class="inner-childauditor">
                            Registration Number -{" "}
                            {ele.data.auditorProfile[0].regstrnNum}
                          </div>
                          <div class="inner-childauditor">
                            Srn Of Form ADT1 -{" "}
                            {ele.data.auditorProfile[0].srnOfFormADT1}
                          </div>
                        </div>
                        <div class="child-containerauditor">
                          <div class="inner-childauditor">
                            Financial End Date - {ele.data.financialEndDate}
                          </div>
                          <div class="inner-childauditor">
                            Financial Start Date - {ele.data.financialStartDate}
                          </div>
                        </div>
                      </div> */}

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
            <div className="card mt-4  br-1 ">
              <div>
                <div className="border-bottom">
                  <div className="d-flex flex-row align-items-center justify-content-between p-4">
                    <div className="d-flex gap-3">
                      <label className="font-size-14 font-wt-600">{`Shipment details - ${shipmentCount}`}</label>
                      <img
                        className="cursor"
                        onClick={() =>
                          setIsShipmentsExpanded(!isShipmentsExpanded)
                        }
                        src="assets/images/arrowdown.png"
                        height={20}
                        width={20}
                        style={isShipmentsExpanded ? {} : { rotate: "180deg" }}
                      />
                    </div>
                  </div>
                </div>
                {isShipmentsExpanded && (
                  <>
                    <div className="filter-div ml-0 mt-1">
                      <Filter
                        filterData={filterData}
                        setFilterData={setFilterData}
                        showFilterBtn={true}
                        showResultPerPage={true}
                        count={shipmentCount}
                        filter={filter}
                        setFilter={setFilter}
                        refresh={refresh}
                        setRefresh={setRefresh}
                      />
                    </div>
                    <div className="mb-3">
                      <NewTable
                        //columns={Shipmentcolumns}
                        filterData={filterData}
                        setFilterData={setFilterData}
                        filteredSearch={filteredSearch}
                        setFilteredSearch={setFilteredSearch}
                        tableFixed
                        data={shipmentsdata}
                        columns={[
                          {
                            name: "Date",
                            filter: true,
                            filterDataKey: "Date",
                            sort: [
                              {
                                name: "Latest First",
                                selected: filter.sortdate === 1,
                                onActionClick: () => {
                                  setFilter({
                                    ...filter,
                                    sortdate: 1,
                                    sortBuyerName: false,
                                  });
                                  setRefresh(refresh + 1);
                                },
                              },
                              {
                                name: "Earliest First",
                                selected: filter.sortdate === -1,
                                onActionClick: () => {
                                  setFilter({
                                    ...filter,
                                    sortdate: -1,
                                    sortBuyerName: false,
                                  });
                                  setRefresh(refresh + 1);
                                },
                              },
                            ],
                          },
                          {
                            name: "Buyer name",
                            filter: true,
                            filterDataKey: "Buyer name",
                            sort: [
                              {
                                name: "A to Z",
                                selected: filter.sortBuyerName === 1,
                                onActionClick: () => {
                                  setFilter({
                                    ...filter,
                                    sortBuyerName: 1,
                                    sortdate: false,
                                  });
                                  setRefresh(refresh + 1);
                                },
                              },
                              {
                                name: "Z to A",
                                selected: filter.sortBuyerName === -1,
                                onActionClick: () => {
                                  setFilter({
                                    ...filter,
                                    sortBuyerName: -1,
                                    sortdate: false,
                                  });
                                  setRefresh(refresh + 1);
                                },
                              },
                            ],
                          },
                          { name: "Weight", filter: false },
                          { name: "Product", filter: false },
                          { name: "HSN Code" },
                          { name: "From", filter: false },
                          { name: "To", filter: false },
                        ]}
                        disableAction={true}
                      />
                    </div>
                    <Pagination
                      page={page}
                      totalCount={shipmentCount}
                      onPageChange={(p) => setPage(p)}
                      perPage={filter.resultPerPage || 10}
                    />
                  </>
                )}
              </div>
            </div>
            <div className="card mt-4  br-1 ">
              <div>
                <div className="border-bottom">
                  <div className="d-flex flex-row align-items-center justify-content-between p-4">
                    <div className="d-flex gap-3">
                      <label className="font-size-14 font-wt-600">{`Buyer list - ${buyersCount}`}</label>
                      <img
                        className="cursor"
                        onClick={() => setIsBuyersExpanded(!isBuyersExpanded)}
                        src="assets/images/arrowdown.png"
                        height={20}
                        width={20}
                        style={isBuyersExpanded ? {} : { rotate: "180deg" }}
                      />
                    </div>
                  </div>
                </div>
                {isBuyersExpanded && (
                  <>
                    <div className="filter-div ml-0 mt-1">
                      <Filter
                        filteredSearch={filteredSearch}
                        setFilteredSearch={setFilteredSearch}
                        filterData={buyersfilterData}
                        setFilterData={setbuyersFilterData}
                        showFilterBtn={true}
                        showResultPerPage={true}
                        count={buyersCount}
                        filter={buyersfilter}
                        setFilter={setbuyersFilter}
                        refresh={buyersrefresh}
                        setRefresh={setbuyersRefresh}
                      />
                    </div>
                    <div className="mb-3">
                      <NewTable
                        //columns={Shipmentcolumns}
                        filterData={buyersfilterData}
                        setFilterData={setbuyersFilterData}
                        filteredSearch={buyersfilteredSearch}
                        setFilteredSearch={setbuyersFilteredSearch}
                        tableFixed
                        data={buyersdata}
                        columns={[
                          { name: "Buyer Name", filter: false },
                          { name: "Shipmenmt", filter: false },
                          { name: "Product", filter: false },
                          { name: "HSN Code" },
                          { name: "FOB", filter: false },
                          { name: "Country", filter: false },
                        ]}
                        disableAction={true}
                      />
                    </div>
                    <Pagination
                      page={buyerspage}
                      totalCount={buyersCount}
                      onPageChange={(p) => setbuyersPage(p)}
                      perPage={10}
                    />
                  </>
                )}
              </div>
            </div>
            <div className="card mt-4  br-1 ">
              <div>
                <div className="border-bottom">
                  <div className="d-flex flex-row align-items-center justify-content-between p-4">
                    <div className="d-flex gap-3">
                      <label className="font-size-14 font-wt-600">{`Task - ${tasksCount}`}</label>
                      <img
                        className="cursor"
                        onClick={() => setIsTaskExpanded(!isTaskExpanded)}
                        src="assets/images/arrowdown.png"
                        height={20}
                        width={20}
                        style={isTaskExpanded ? {} : { rotate: "180deg" }}
                      />
                    </div>
                  </div>
                </div>
                {isTaskExpanded && (
                  <>
                    <div className="filter-div ml-0 mt-1">
                      <Filter
                        filterData={tasksfilterData}
                        setFilterData={settasksFilterData}
                        showFilterBtn={true}
                        showResultPerPage={true}
                        count={tasksCount}
                        filter={tasksfilter}
                        setFilter={settasksFilter}
                        refresh={tasksrefresh}
                        setRefresh={settasksRefresh}
                      />
                    </div>
                    <div className="mb-3">
                      <NewTable
                        //columns={Shipmentcolumns}
                        filterData={tasksfilterData}
                        setFilterData={settasksFilterData}
                        filteredSearch={tasksfilteredSearch}
                        setFilteredSearch={settasksFilteredSearch}
                        tableFixed
                        data={tasksdata}
                        columns={[
                          { name: "Date", filter: false },
                          { name: "Status", filter: false },
                          { name: "Type" },
                          { name: "Task Name", filter: false },
                          { name: "Creator", filter: false },
                          { name: "Remark", filter: false },
                        ]}
                        disableAction={true}
                      />
                    </div>
                    <Pagination
                      page={taskspage}
                      totalCount={tasksCount}
                      onPageChange={(p) => settasksPage(p)}
                      perPage={10}
                    />
                  </>
                )}
              </div>
            </div>
            {data.STATUS && data.STATUS === 1 ? (
              <div className="card mt-4  br-1 ">
                <div>
                  <div className="border-bottom">
                    <div className="d-flex flex-row align-items-center justify-content-between p-4">
                      <div className="d-flex gap-3">
                        <label className="font-size-14 font-wt-600">
                          Lead Created
                        </label>
                        <img
                          className="cursor"
                          onClick={() =>
                            setIsLeadCreatedExpanded(!isLeadCreatedExpanded)
                          }
                          src="assets/images/arrowdown.png"
                          height={20}
                          width={20}
                          style={
                            isLeadCreatedExpanded ? {} : { rotate: "180deg" }
                          }
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
            <div className="card mt-4  br-1 ">
              <div>
                <div className="border-bottom">
                  <div className="d-flex flex-row align-items-center justify-content-between p-4">
                    <div className="d-flex gap-3">
                      <label className="font-size-14 font-wt-600">{`HSN Code - ${hscodesCount}`}</label>
                      <img
                        className="cursor"
                        onClick={() => setIsHSCodesExpanded(!isHSCodesExpanded)}
                        src="assets/images/arrowdown.png"
                        height={20}
                        width={20}
                        style={isHSCodesExpanded ? {} : { rotate: "180deg" }}
                      />
                    </div>
                  </div>
                </div>
                {isHSCodesExpanded && (
                  <>
                    <div className="filter-div ml-0 mt-1">
                      <Filter
                        filterData={hscodesfilterData}
                        setFilterData={sethscodesFilterData}
                        showFilterBtn={true}
                        showResultPerPage={true}
                        count={hscodesCount}
                        filter={hscodesfilter}
                        setFilter={sethscodesFilter}
                        refresh={hscodesrefresh}
                        setRefresh={sethscodesRefresh}
                      />
                    </div>
                    <div className="mb-3">
                      <NewTable
                        //columns={Shipmentcolumns}
                        filterData={hscodesfilterData}
                        setFilterData={sethscodesFilterData}
                        filteredSearch={hscodesfilteredSearch}
                        setFilteredSearch={sethscodesFilteredSearch}
                        tableFixed
                        data={hscodesdata}
                        columns={[
                          {
                            name: "HSN Code",
                          },
                          {
                            name: "Sub Codes",
                          },
                          {
                            name: "Buyer",
                          },
                          {
                            name: "Shipment",
                          },
                          {
                            name: "Shipment Value",
                          },
                          {
                            name: "Product Description",
                          },
                          {
                            name: "Top Export Countries",
                          },
                        ]}
                        disableAction={true}
                      />
                    </div>
                    <Pagination
                      page={hscodespage}
                      totalCount={hscodesCount}
                      onPageChange={(p) => sethscodesPage(p)}
                      perPage={10}
                    />
                  </>
                )}
              </div>
            </div>
          </div>
        )}
        {HSDetails.show && (
          <div>
            {HSDetails.data.map((item, index) => {
              return (
                <div className="card mt-4  br-1 ">
                  <div>
                    <div className="border-bottom">
                      <div className="d-flex flex-row align-items-center justify-content-between p-4">
                        <div className="d-flex gap-3">
                          <label className="font-size-14 font-wt-600">{`HSN Code - ${item.HS_CODE}`}</label>
                          <img
                            className="cursor"
                            onClick={() =>
                              setHSExpanded({
                                ...hsExpanded,
                                [item.HS_CODE]: !hsExpanded[item.HS_CODE],
                              })
                            }
                            src="assets/images/arrowdown.png"
                            height={20}
                            width={20}
                            style={
                              hsExpanded[item.HS_CODE] ||
                                item.HS_CODE === HSDetails.selectedHS
                                ? {}
                                : { rotate: "180deg" }
                            }
                          />
                        </div>
                      </div>
                    </div>
                    {(hsExpanded[item.HS_CODE] ||
                      item.HS_CODE === HSDetails.selectedHS) && (
                        <div className="my-4">
                          <div className="col-md-12">
                            <div className="p-1 h-100">
                              <div>
                                <div class="dropdown">
                                  <div className="d-flex flex-row align-items-center justify-content-between my-3 ml-3">
                                    <div className="d-flex align-items-center ">
                                      <label
                                        className="text-left font-size-14 font-wt-600 mr-3 mb-0 cursor"
                                        onClick={() => { }}
                                      >{`Chapter ${item.HS_CODE} Price History`}</label>
                                    </div>

                                    <div className="d-flex flex-row align-items-center gap-2">
                                      <div className="pr-3">
                                        <NewInput
                                          type={"date"}
                                          name={`priceHistoryFrom_${item.HS_CODE}`}
                                          value={
                                            graphConfiguration[
                                            `priceHistoryFrom_${item.HS_CODE}`
                                            ]
                                          }
                                          onChange={
                                            handleGraphConfigurationChange
                                          }
                                          removeMb
                                        />
                                      </div>
                                      <div className="pr-3">
                                        <NewInput
                                          type={"date"}
                                          name={`priceHistoryTo_${item.HS_CODE}`}
                                          value={
                                            graphConfiguration[
                                            `priceHistoryTo_${item.HS_CODE}`
                                            ]
                                          }
                                          onChange={
                                            handleGraphConfigurationChange
                                          }
                                          removeMb
                                        />
                                      </div>
                                      <div className="pr-3">
                                        <img
                                          onClick={() => {
                                            setGraphTableMode({
                                              ...graphTableMode,
                                              [`priceHis_${item.HS_CODE}`]:
                                                !graphTableMode[
                                                `priceHis_${item.HS_CODE}`
                                                ],
                                            });
                                          }}
                                          className="cursor"
                                          src={`/assets/images/${graphTableMode?.[
                                            `priceHis_${item.HS_CODE}`
                                          ]
                                            ? "filterTableMode"
                                            : "filterGraphMode"
                                            }.png`}
                                        />
                                      </div>
                                      <div className="">
                                        <img
                                          onClick={() =>
                                            ExportExcel(
                                              priceHistoryTableData[
                                              item.HS_CODE
                                              ] || [],
                                              `HS_${item.HS_CODE}_PriceTrend`
                                            )
                                          }
                                          className="cursor"
                                          src="/assets/images/download_icon_with_bg.png"
                                        />
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="pt-4">
                                {graphTableMode[`priceHis_${item.HS_CODE}`] ? (
                                  <CustomLineChart
                                    XFormatter={(value) =>
                                      getXAxisDateFormat(
                                        graphConfiguration[
                                        `priceHistoryTo_${item.HS_CODE}`
                                        ],
                                        graphConfiguration[
                                        `priceHistoryFrom_${item.HS_CODE}`
                                        ],
                                        value
                                      )
                                    }
                                    YFormatter={(value) =>
                                      "$ " +
                                      Intl.NumberFormat("en-US", {
                                        notation: "compact",
                                      }).format(value)
                                    }
                                    bardataConfig={
                                      chartconfig[`config_${item.HS_CODE}`]
                                    }
                                    formatterFunction={(value, name) => [
                                      "$ " +
                                      Intl.NumberFormat("en-US", {
                                        notation: "compact",
                                      }).format(value),
                                      name,
                                    ]}
                                    data={graphdata[[`graph_${item.HS_CODE}`]]}
                                    xDataKey={"label"}
                                    isLegend={true}
                                    tab={"Values"}
                                    type={"Average"}
                                  />
                                ) : (
                                  <NewTable
                                    disableAction={true}
                                    columns={
                                      graphColumns[`price_his${item.HS_CODE}`] ||
                                      []
                                    }
                                    data={
                                      priceHistoryTableData[item.HS_CODE] || []
                                    }
                                  />
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="col-md-12">
                            <div className="p-1 h-100">
                              <div>
                                <div class="dropdown">
                                  <div className="d-flex flex-row align-items-center justify-content-between my-3 ml-3">
                                    <div className="d-flex align-items-center ">
                                      <label
                                        className="text-left font-size-14 font-wt-600 mr-3 mb-0 cursor"
                                        onClick={() => { }}
                                      >{`Export History`}</label>
                                    </div>

                                    <div className="d-flex flex-row align-items-center gap-2">
                                      <div>
                                        <ul
                                          className="nav pricingtabs nav-pills bg-white mx-auto rounded-pill p-0 shadow-sm"
                                          id="pills-tab"
                                          role="tablist"
                                        >
                                          <li
                                            className="nav-item p-0 "
                                            role="presentation"
                                          >
                                            <button
                                              onClick={() => {
                                                setTab({
                                                  ...tab,
                                                  [item.HS_CODE]: "Values",
                                                });
                                              }}
                                              className="nav-link active w-100 roundedpillleft font-size-14"
                                              id="pills-All-tab"
                                              data-bs-toggle="pill"
                                              data-bs-target="#pills-All"
                                              type="button"
                                              role="tab"
                                              aria-controls="pills-All"
                                              aria-selected="true"
                                            >
                                              Values ($)
                                            </button>
                                          </li>
                                          <li
                                            className="nav-item p-0 "
                                            role="presentation"
                                          >
                                            <button
                                              onClick={() => {
                                                setTab({
                                                  ...tab,
                                                  [item.HS_CODE]: "Count",
                                                });
                                              }}
                                              className="nav-link w-100 roundedpillright font-size-14 "
                                              id="pills-Yearly-tab"
                                              data-bs-toggle="pill"
                                              data-bs-target="#pills-Yearly"
                                              type="button"
                                              role="tab"
                                              aria-controls="pills-Yearly"
                                              aria-selected="false"
                                            >
                                              Avg Quantity
                                            </button>
                                          </li>
                                        </ul>
                                      </div>
                                      <div className="pr-3">
                                        <NewInput
                                          type={"date"}
                                          name={`ExportHistoryFrom_${item.HS_CODE}`}
                                          value={
                                            graphConfiguration[
                                            `ExportHistoryFrom_${item.HS_CODE}`
                                            ]
                                          }
                                          onChange={
                                            handleGraphConfigurationChange
                                          }
                                          removeMb
                                        />
                                      </div>
                                      <div className="pr-3">
                                        <NewInput
                                          type={"date"}
                                          name={`ExportHistoryTo_${item.HS_CODE}`}
                                          value={
                                            graphConfiguration[
                                            `ExportHistoryTo_${item.HS_CODE}`
                                            ]
                                          }
                                          onChange={
                                            handleGraphConfigurationChange
                                          }
                                          removeMb
                                        />
                                      </div>
                                      <div className="pr-3">
                                        <img
                                          onClick={() => {
                                            setGraphTableMode({
                                              ...graphTableMode,
                                              [`ExpHis_${item.HS_CODE}`]:
                                                !graphTableMode[
                                                `ExpHis_${item.HS_CODE}`
                                                ],
                                            });
                                          }}
                                          className="cursor"
                                          src={`/assets/images/${graphTableMode?.[
                                            `ExpHis_${item.HS_CODE}`
                                          ]
                                            ? "filterTableMode"
                                            : "filterGraphMode"
                                            }.png`}
                                        />
                                      </div>
                                      <div className="">
                                        <img
                                          onClick={() =>
                                            ExportExcel(
                                              exportHistoryTableData[
                                              item.HS_CODE
                                              ] || [],
                                              `HS_${item.HS_CODE}_ExportTrend`
                                            )
                                          }
                                          className="cursor"
                                          src="/assets/images/download_icon_with_bg.png"
                                        />
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="pt-4">
                                {graphTableMode[`ExpHis_${item.HS_CODE}`] ? (
                                  <CustomLineChart
                                    XFormatter={(value) =>
                                      getXAxisDateFormat(
                                        graphConfiguration[
                                        `ExportHistoryTo_${item.HS_CODE}`
                                        ],
                                        graphConfiguration[
                                        `ExportHistoryFrom_${item.HS_CODE}`
                                        ],
                                        value
                                      )
                                    }
                                    YFormatter={(value) =>
                                      tab[item.HS_CODE] === "Values"
                                        ? "$ " +
                                        Intl.NumberFormat("en-US", {
                                          notation: "compact",
                                        }).format(value)
                                        : value
                                    }
                                    bardataConfig={
                                      tab[item.HS_CODE] === "Values"
                                        ? exportchartconfig[
                                        `config_${item.HS_CODE}`
                                        ]
                                        : quantitychartconfig[
                                        `quantconfig_${item.HS_CODE}`
                                        ]
                                    }
                                    formatterFunction={(value, name) => [
                                      tab[item.HS_CODE] === "Values"
                                        ? "$ " +
                                        Intl.NumberFormat("en-US", {
                                          notation: "compact",
                                        }).format(value)
                                        : value,
                                      name?.split("_")[0],
                                    ]}
                                    data={
                                      exportHistory[[`graph_${item.HS_CODE}`]]
                                    }
                                    xDataKey={"label"}
                                    isLegend={true}
                                    tab={tab[item.HS_CODE]}
                                    type={
                                      tab[item.HS_CODE] === "Values"
                                        ? "Sum"
                                        : "Average"
                                    }
                                  />
                                ) : (
                                  <NewTable
                                    disableAction={true}
                                    columns={
                                      graphColumns[
                                      `expHistory_${item.HS_CODE}`
                                      ] || []
                                    }
                                    data={
                                      exportHistoryTableData[item.HS_CODE] || []
                                    }
                                  />
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="p-1  border-0  h-100 d-flex flex-row pt-5 pb-4 mx-3">
                            <div className="col-6">
                              <div className="d-flex align-items-center justify-content-between">
                                <label className="font-size-13 font-wt-600 m-0">
                                  Top Export Countries
                                </label>
                                <div className="d-flex flex-row align-items-center pl-4">
                                  <label className="font-size-13 mb-0 font-wt-600 mr-1">
                                    {"Fiscal Year-  "}
                                  </label>
                                  <label
                                    class="text-decoration-underline font-size-15 font-wt-400 m-0"
                                    id="dropdownMenuButton1"
                                    data-bs-toggle="dropdown"
                                    aria-expanded="false"
                                  >
                                    {countriesFilter[item.HS_CODE] || "-"}
                                    <img
                                      src="/assets/images/arrowdown.png"
                                      className="ml-2"
                                    />
                                  </label>
                                  <ul
                                    class="dropdown-menu dropdownScroller"
                                    aria-labelledby="dropdownMenuButton1"
                                  >
                                    {fiscalyears.map((element) => {
                                      return (
                                        <li
                                          className="dropdown-item cursor font-wt-500 "
                                          onClick={() => {
                                            setCountriesFilter({
                                              ...countriesFilter,
                                              [item.HS_CODE]: element.label,
                                            });
                                          }}
                                        >
                                          {element.label}
                                        </li>
                                      );
                                    })}
                                  </ul>
                                </div>
                                <div
                                  className={`d-flex flex-row align-items-center w-auto p-2 m-2`}
                                >
                                  <div className="pr-3">
                                    <img
                                      onClick={() => { }}
                                      className="cursor"
                                      src={`/assets/images/${graphTableMode?.[`ExpHis_${item.HS_CODE}`]
                                        ? "filterTableMode"
                                        : "filterGraphMode"
                                        }.png`}
                                    />
                                  </div>
                                  <div className="">
                                    <img
                                      onClick={() =>
                                        ExportExcel(
                                          countriesChart[
                                          `countries_${item.HS_CODE}`
                                          ] || [],
                                          `HS_${item.HS_CODE}_ExportCountries`
                                        )
                                      }
                                      className="cursor"
                                      src="/assets/images/download_icon_with_bg.png"
                                    />
                                  </div>
                                </div>
                              </div>
                              <div className="d-flex gap-3 h-100">
                                <div className="col-md-6 ">
                                  <PieChartComponent
                                    data={
                                      countriesChart[
                                      `countries_${item.HS_CODE}`
                                      ] || []
                                    }
                                    dataKey="country_count"
                                    label1={""}
                                    label2={""}
                                    colors={countriesColor}
                                    totalCount={gettotalCount(
                                      countriesChart[
                                      `countries_${item.HS_CODE}`
                                      ] || [],
                                      "country_count"
                                    )}
                                  />
                                </div>
                                <div className="d-flex flex-column justify-content-center col-md-6 mt-3">
                                  {countriesChart[
                                    `countries_${item.HS_CODE}`
                                  ]?.map((item, index) => {
                                    return (
                                      <p className=" letter-spacing05 font-wt-300 font-size-12 mb-4">
                                        <span
                                          className="Financelimitapplied me-2"
                                          style={{
                                            backgroundColor:
                                              countriesColor[index],
                                          }}
                                        ></span>
                                        {item.DESTINATION_COUNTRY}
                                      </p>
                                    );
                                  })}
                                </div>
                              </div>
                            </div>

                            <div className="col-6">
                              <div className="d-flex align-items-center justify-content-between">
                                <label className="font-size-13 font-wt-600 m-0">
                                  Top Lanes Used
                                </label>
                                <div className="d-flex flex-row align-items-center pl-4">
                                  <label className="font-size-13 mb-0 font-wt-600 mr-1">
                                    {"Fiscal Year-  "}
                                  </label>
                                  <label
                                    class="text-decoration-underline font-size-15 font-wt-400 m-0"
                                    id="dropdownMenuButton1"
                                    data-bs-toggle="dropdown"
                                    aria-expanded="false"
                                  >
                                    {lanesFilter[item.HS_CODE] || "-"}
                                    <img
                                      src="/assets/images/arrowdown.png"
                                      className="ml-2"
                                    />
                                  </label>
                                  <ul
                                    class="dropdown-menu dropdownScroller"
                                    aria-labelledby="dropdownMenuButton1"
                                  >
                                    {fiscalyears.map((element) => {
                                      return (
                                        <li
                                          className="dropdown-item cursor font-wt-500 "
                                          onClick={() => {
                                            setLanesFilter({
                                              ...lanesFilter,
                                              [item.HS_CODE]: element.label,
                                            });
                                          }}
                                        >
                                          {element.label}
                                        </li>
                                      );
                                    })}
                                  </ul>
                                </div>
                                <div
                                  className={`d-flex flex-row align-items-center w-auto p-2 m-2`}
                                >
                                  <div className="pr-3">
                                    <img
                                      onClick={() => { }}
                                      className="cursor"
                                      src={`/assets/images/${graphTableMode?.[`ExpHis_${item.HS_CODE}`]
                                        ? "filterTableMode"
                                        : "filterGraphMode"
                                        }.png`}
                                    />
                                  </div>
                                  <div className="">
                                    <img
                                      onClick={() =>
                                        ExportExcel(
                                          lanesChart[`lanes_${item.HS_CODE}`] ||
                                          [],
                                          `HS_${item.HS_CODE}_Lanes`
                                        )
                                      }
                                      className="cursor"
                                      src="/assets/images/download_icon_with_bg.png"
                                    />
                                  </div>
                                </div>
                              </div>
                              <div className="d-flex gap-3 h-100">
                                <div className="col-md-6">
                                  <PieChartComponent
                                    data={
                                      lanesChart[`lanes_${item.HS_CODE}`] || []
                                    }
                                    dataKey="port_count"
                                    label1={""}
                                    label2={""}
                                    colors={lanesColor}
                                    totalCount={gettotalCount(
                                      lanesChart[`lanes_${item.HS_CODE}`] || [],
                                      "port_count"
                                    )}
                                  />
                                </div>
                                <div className="d-flex flex-column justify-content-center col-md-6 mt-3">
                                  {lanesChart[`lanes_${item.HS_CODE}`]?.map(
                                    (item, index) => {
                                      return (
                                        <p className=" letter-spacing05 font-wt-300 font-size-12 mb-4">
                                          <span
                                            className="Financelimitapplied me-2"
                                            style={{
                                              backgroundColor: lanesColor[index],
                                            }}
                                          ></span>
                                          {item.INDIAN_PORT +
                                            " > " +
                                            item.DESTINATION_PORT}
                                        </p>
                                      );
                                    }
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="p-1  border-0  h-100 d-flex flex-row pt-5 pb-4 mx-3">
                            <div className="col-6">
                              <div className="d-flex align-items-center justify-content-between">
                                <label className="font-size-13 font-wt-600 m-0">
                                  Top Port Of loading
                                </label>
                                <div className="d-flex flex-row align-items-center pl-4">
                                  <label className="font-size-13 mb-0 font-wt-600 mr-1">
                                    {"Fiscal Year-  "}
                                  </label>
                                  <label
                                    class="text-decoration-underline font-size-15 font-wt-400 m-0"
                                    id="dropdownMenuButton1"
                                    data-bs-toggle="dropdown"
                                    aria-expanded="false"
                                  >
                                    {shipmentsFromFilter[item.HS_CODE] || "-"}
                                    <img
                                      src="/assets/images/arrowdown.png"
                                      className="ml-2"
                                    />
                                  </label>
                                  <ul
                                    class="dropdown-menu dropdownScroller"
                                    aria-labelledby="dropdownMenuButton1"
                                  >
                                    {fiscalyears.map((element) => {
                                      return (
                                        <li
                                          className="dropdown-item cursor font-wt-500 "
                                          onClick={() => {
                                            setShipmentsFromFilter({
                                              ...shipmentsFromFilter,
                                              [item.HS_CODE]: element.label,
                                            });
                                          }}
                                        >
                                          {element.label}
                                        </li>
                                      );
                                    })}
                                  </ul>
                                </div>
                                <div
                                  className={`d-flex flex-row align-items-center w-auto p-2 m-2`}
                                >
                                  <div className="pr-3">
                                    <img
                                      onClick={() => { }}
                                      className="cursor"
                                      src={`/assets/images/${graphTableMode?.[`ExpHis_${item.HS_CODE}`]
                                        ? "filterTableMode"
                                        : "filterGraphMode"
                                        }.png`}
                                    />
                                  </div>
                                  <div className="">
                                    <img
                                      onClick={() =>
                                        ExportExcel(
                                          shipmentsFromChart[
                                          `source_port_${item.HS_CODE}`
                                          ] || [],
                                          `HS_${item.HS_CODE}_LoadingPorts`
                                        )
                                      }
                                      className="cursor"
                                      src="/assets/images/download_icon_with_bg.png"
                                    />
                                  </div>
                                </div>
                              </div>
                              <div className="d-flex gap-3 h-100">
                                <div className="col-md-6">
                                  <PieChartComponent
                                    data={
                                      shipmentsFromChart[
                                      `source_port_${item.HS_CODE}`
                                      ] || []
                                    }
                                    dataKey={"port_count"}
                                    label1={""}
                                    label2={""}
                                    colors={shipmentsFrom}
                                    totalCount={gettotalCount(
                                      shipmentsFromChart[
                                      `source_port_${item.HS_CODE}`
                                      ] || [],
                                      "port_count"
                                    )}
                                  />
                                </div>
                                <div className="d-flex flex-column justify-content-center col-md-6 mt-3">
                                  {shipmentsFromChart[
                                    `source_port_${item.HS_CODE}`
                                  ]?.map((item, index) => {
                                    return (
                                      <p className=" letter-spacing05 font-wt-300 font-size-12 mb-4">
                                        <span
                                          className="Financelimitapplied me-2"
                                          style={{
                                            backgroundColor: shipmentsFrom[index],
                                          }}
                                        ></span>
                                        {item.INDIAN_PORT}
                                      </p>
                                    );
                                  })}
                                </div>
                              </div>
                            </div>

                            <div className="col-6">
                              <div className="d-flex align-items-center justify-content-between">
                                <label className="font-size-13 font-wt-600 m-0">
                                  Top Port Of Discharge
                                </label>
                                <div className="d-flex flex-row align-items-center pl-4">
                                  <label className="font-size-13 mb-0 font-wt-600 mr-1">
                                    {"Fiscal Year-  "}
                                  </label>
                                  <label
                                    class="text-decoration-underline font-size-15 font-wt-400 m-0"
                                    id="dropdownMenuButton1"
                                    data-bs-toggle="dropdown"
                                    aria-expanded="false"
                                  >
                                    {shipmentsToFilter[item.HS_CODE] || "-"}
                                    <img
                                      src="/assets/images/arrowdown.png"
                                      className="ml-2"
                                    />
                                  </label>
                                  <ul
                                    class="dropdown-menu dropdownScroller"
                                    aria-labelledby="dropdownMenuButton1"
                                  >
                                    {fiscalyears.map((element) => {
                                      return (
                                        <li
                                          className="dropdown-item cursor font-wt-500 "
                                          onClick={() => {
                                            setShipmentsToFilter({
                                              ...shipmentsToFilter,
                                              [item.HS_CODE]: element.label,
                                            });
                                          }}
                                        >
                                          {element.label}
                                        </li>
                                      );
                                    })}
                                  </ul>
                                </div>
                                <div
                                  className={`d-flex flex-row align-items-center w-auto p-2 m-2`}
                                >
                                  <div className="pr-3">
                                    <img
                                      onClick={() => { }}
                                      className="cursor"
                                      src={`/assets/images/${graphTableMode?.[`ExpHis_${item.HS_CODE}`]
                                        ? "filterTableMode"
                                        : "filterGraphMode"
                                        }.png`}
                                    />
                                  </div>
                                  <div className="">
                                    <img
                                      onClick={() =>
                                        ExportExcel(
                                          shipmentsToChart[
                                          `destination_port_${item.HS_CODE}`
                                          ] || [],
                                          `HS_${item.HS_CODE}_DestinationPorts`
                                        )
                                      }
                                      className="cursor"
                                      src="/assets/images/download_icon_with_bg.png"
                                    />
                                  </div>
                                </div>
                              </div>
                              <div className="d-flex gap-3 h-100">
                                <div className="col-md-6">
                                  <PieChartComponent
                                    data={
                                      shipmentsToChart[
                                      `destination_port_${item.HS_CODE}`
                                      ] || []
                                    }
                                    dataKey={"port_count"}
                                    label1={""}
                                    label2={""}
                                    colors={shipmentsTo}
                                    totalCount={gettotalCount(
                                      shipmentsToChart[
                                      `destination_port_${item.HS_CODE}`
                                      ] || [],
                                      "port_count"
                                    )}
                                  />
                                </div>
                                <div className="d-flex flex-column justify-content-center col-md-6 mt-3">
                                  {shipmentsToChart[
                                    `destination_port_${item.HS_CODE}`
                                  ]?.map((item, index) => {
                                    return (
                                      <p className=" letter-spacing05 font-wt-300 font-size-12 mb-4">
                                        <span
                                          className="Financelimitapplied me-2"
                                          style={{
                                            backgroundColor: shipmentsTo[index],
                                          }}
                                        ></span>
                                        {item.DESTINATION_PORT}
                                      </p>
                                    );
                                  })}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
};
const mapStateToProps = (state) => {
  return {
    navToggleState: state,
  };
};
export default connect(mapStateToProps)(CRMUserDetails);
