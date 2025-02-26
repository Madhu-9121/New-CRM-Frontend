import React, { useEffect, useRef, useState } from "react";
import { Calendar } from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { connect } from "react-redux";
import {
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  AreaChart,
} from "recharts";
import call from "../../service";
import NewTablev2 from "../../utils/newTablev2";
import Header from "../partial/header";
import HeaderV2 from "../partial/headerV2";
import Sidebar, { traderTypeIds } from "../partial/sidebar";
import SideBarV2 from "../partial/sideBarV2";
import CalendarTab from "./components/CalendarTab";
import ExporterSummaryChart from "./components/ExporterSummaryChart";
import Details from "./components/Details";
import FinancerDv2Taskupdate from "./components/financerDv2taskupdate";
import Shipmentschart from "./components/Shipmentschart";
import Stats from "./components/Stats";
import TaskUpdate from "./components/taskUpdate";
import {
  SupplierData,
  FinanceData,
  SupplierDetailsData,
  FinancerDetailsData,
} from "./DataJson";
import FinancerChart from "./components/FinancerChart";
import FinancerDisbursement from "./components/FinancerDisbursementChart";
import { AdminDashbord } from "./AdminDashboard";
import { ToastContainer } from "react-toastify";
import CRMDashboard from "./CRMDashboard";
import { CustomSelect, NewInput, NewSelect } from "../../utils/newInput";
import moment from "moment";
import MultipleSelect from "../../utils/MultipleSelect";
import PieChartComponent from "../Reports/components/PieChartComponent";
import toastDisplay from "../../utils/toastNotification";
import { getPercentage } from "../../utils/myFunctions";
import DonutChart from "./components/DonutChart";
import { NewTable } from "../../utils/newTable";
import Filter from "../InvoiceDiscounting/components/Filter";

import Pagination from "../InvoiceDiscounting/contract/components/pagination";

const lanesColor = ["#FFB801", "#2ECC71"];
const lanesName = ["Unsettled", "Settled"];

const lanesColor2 = ["#2ECC71", "#FE4141"];
const lanesName2 = ["Active", "Inactive"];

const lanesColor3 = ["#FFB801", "#2ECC71", "#FE4141", "#ABABAB"];
const lanesName3 = ["Inprocess", "Approved", "Rejected", "Expired"];

const lanesColor4 = ["#5CB8D3", "#FFB801", "#2ECC71", "#FE4141"];
const lanesName4 = ["Available", "Inprocess", "Approved", "Rejected"];

const lanesColor5 = ["#2ECC71", "#FFB801", "#FE4141"];
const lanesName5 = ["Disbursed", "Due", "Over Due"];

const DashboardV2 = ({ userTokenDetails, navToggleState }) => {
  const userTypeId = userTokenDetails.type_id ? userTokenDetails.type_id : null;
  const userEmail = userTokenDetails.email ? userTokenDetails.email : null;
  const userId = userTokenDetails.user_id ? userTokenDetails.user_id : null;

  const ttvExporterCode = userTokenDetails.ttvExporterCode
    ? userTokenDetails.ttvExporterCode
    : "";
  const [graphdata, setgraphdata] = useState([]);
  const [supplierCountdata, setsupplierCountdata] = useState([]);
  console.log(userTokenDetails, "userrrtokennn");
  const [reminders, setReminders] = useState([]);
  const [reminderDate, setReminderDate] = useState(new Date());

  const [FinCountdata, setFinCountdata] = useState([]);
  const [dischartdata, setdischartdata] = useState([]);
  const [AdminTab, setAdminTab] = useState("Admin");
  const [selectedDateFilter, setselectedDateFilter] = useState("Overall");
  const [showCalendar, setshowCalendar] = useState(false);
  const [dateRange, setDateRange] = useState();
  const box = useRef(null);
  const [salesPerson, setSalesPerson] = useState([]);
  const userPermissionsForSubAdmin =
    userTokenDetails.UserAccessPermission || "{}";

  const [showLoader, setshowLoader] = useState(false);
  const [tokenDetails, setTokenDetails] = useState(userTokenDetails);
  const [selectedUser, setSelectedUser] = useState(null);
  const [data, setdata] = useState({});
  const [filter, setFilter] = useState({
    timeFilterFrom: moment().format("YYYY-MM-01"),
    timeFilterTo: moment().format("YYYY-MM-DD"),
  });
  const [refresh, setRefresh] = useState(0);

  const [dateFilters, setdateFillters] = useState([
    { name: "Overall", val: "Overall" },
    { name: "Previous Month", val: "Previous Month" },
    { name: "Previous Week", val: "Previous Week" },
    { name: "Yesterday", val: "Yesterday" },
    { name: "Today", val: "Today" },
    { name: "Current Week", val: "Current Week" },
    { name: "Current Month", val: "Current Month" },
    { name: "Custom", val: "Custom" },
  ]);
  const [cpStats, setCpStats] = useState({});
  let onlyShowForUserId = userPermissionsForSubAdmin?.mainAdmin
    ? undefined
    : userId;

  useEffect(() => {
    setshowLoader(true);
    call("POST", "getCPDashboardStats", {
      userId,
      fromDate: filter.timeFilterFrom,
      toDate: filter.timeFilterTo,
    })
      .then((res) => {
        setCpStats(res);
        setshowLoader(false);
      })
      .catch((err) => {
        toastDisplay("Something went wrong", "error");
        setshowLoader(false);
      });
  }, [refresh]);

  useEffect(() => {
    const tabName = localStorage.getItem("admin_report_name");
    setTab(tabName);
  }, []);
  const handleOutsideClick = (event) => {
    let eventTargetStr = event?.target?.outerHTML;
    console.log("handleOutsideClick", box.current, event?.target?.outerHTML);
    if (box && box.current && !box.current.contains(event.target)) {
      setshowCalendar(false);
    }
  };
  useEffect(() => {
    let startDate;
    let endDate;
    const today = new Date();
    if (selectedDateFilter === "Today") {
      startDate = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate()
      );
      endDate = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate() + 1,
        0,
        0,
        -1
      );
    } else if (selectedDateFilter === "Yesterday") {
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);
      startDate = new Date(
        yesterday.getFullYear(),
        yesterday.getMonth(),
        yesterday.getDate()
      );
      endDate = new Date(
        yesterday.getFullYear(),
        yesterday.getMonth(),
        yesterday.getDate(),
        23,
        59,
        59,
        999
      );
    } else if (selectedDateFilter === "Previous Week") {
      startDate = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate() - 7
      );
      endDate = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate() - 1
      );
    } else if (selectedDateFilter === "Previous Month") {
      startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      endDate = new Date(today.getFullYear(), today.getMonth(), 0);
    } else if (selectedDateFilter === "Current Week") {
      startDate = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate() - today.getDay()
      );
      endDate = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate() + (6 - today.getDay())
      );
    } else if (selectedDateFilter === "Current Month") {
      startDate = new Date(today.getFullYear(), today.getMonth(), 1);
      endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    } else if (selectedDateFilter === "Custom") {
      setshowCalendar(true);
      return;
    } else if (selectedDateFilter === "Overall") {
      startDate = new Date(2021, 1, 1);
      endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    }
    setDateRange({
      from: moment(startDate).format("YYYY-MM-DD"),
      to: moment(endDate).format("YYYY-MM-DD"),
    });
  }, [selectedDateFilter]);
  const handleMultiSelectchange = (e, name, val, singleSelect) => {
    if (singleSelect) {
      setdata({
        ...data,
        [name]: e?.[0]?.[val] ? e.reverse()?.[0]?.[val] : null,
      });
    } else {
      setdata({
        ...data,
        [name]: Array.isArray(e) ? e.map((x) => x[val]) : [],
      });
    }
  };
  useEffect(() => {
    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);
  const getDashboardCounts = () => {
    call("POST", "getdashboardCounts", { userId, ttvExporterCode })
      .then((result) => {
        console.log("success in getdashboardCounts", result);
        setsupplierCountdata(result);
      })
      .catch((e) => {
        console.log("error in getdashboardCounts", e);
        setsupplierCountdata(e);
      });
  };
  const getDashboardCountsFin = () => {
    call("POST", "getFindashboardCounts", { userId })
      .then((result) => {
        console.log("success in getdashboardCounts", result);
        setFinCountdata(result);
      })
      .catch((e) => {
        console.log("error in getdashboardCounts", e);
        setFinCountdata(e);
      });
  };
  const getExporterSummary = () => {
    let reqObj = {
      userId: userId,
      startYear: 2017,
      endYear: new Date().getFullYear(),
      ttvExporterCode,
    };
    call("POST", "getExporterSummary", reqObj)
      .then((result) => {
        console.log("success in getExporterSummary", result);
        setgraphdata(result);
      })
      .catch((e) => {
        console.log("error in getdashboardCounts", e);
      });
  };
  const getdisbursementchartdata = () => {
    let reqObj = {
      userId: userId,
      startYear: 2017,
      endYear: new Date().getFullYear(),
    };
    call("POST", "getdisbursementchart", reqObj)
      .then((result) => {
        setdischartdata(result);
      })
      .catch((e) => {
        console.log("error in getdisbursementchart", e);
      });
  };
  useEffect(() => {
    if (userTypeId === 19) {
      setTab(1);
      getDashboardCounts();
      getExporterSummary();
    } else if (userTypeId === 8) {
      setTab(2);
      getDashboardCountsFin();
      getdisbursementchartdata();
    } else if (userTypeId === 3) {
      window.location = "/sign-invoice-agreement";
    } else {
      setTab(3);
    }
  }, []);

  useEffect(() => {
    if (onlyShowForUserId) {
      let reqObj = {
        parentId: onlyShowForUserId,
      };
      console.log("onlyshowfor userid", reqObj);
      call("POST", "getSubAdminUser", reqObj)
        .then((res) => {
          console.log("onlyshowfor userid", res);
          setshowLoader(false);
          setSalesPerson(res.data);
        })
        .catch((err) => setshowLoader(false));
    } else {
      call("POST", "getSubAdminUser", {})
        .then((res) => {
          setshowLoader(false);
          setSalesPerson(res.data);
        })
        .catch((err) => setshowLoader(false));
    }
  }, []);

  //1 - Exporter
  //2 - Financier
  //3 - Admin
  const [tab, setTab] = useState(null);
  useEffect(() => {
    console.log("discbarrrtttttttttt", salesPerson, onlyShowForUserId);
  }, [salesPerson]);
  //console.log('discbarrrtttttttttt', salesPerson, onlyShowForUserId)

  useEffect(() => {
    fetchReminders();
  }, [reminderDate]);

  async function fetchReminders() {
    setshowLoader(true);
    let apiResp = await call("POST", "getUserRemindersByDate", {
      userId,
      selectedDate: moment(reminderDate).format("YYYY-MM-DD"),
    });
    setReminders(apiResp);
    setshowLoader(false);
  }

  const CustomTooltipForCPRevenue = ({ payload }) => {
    return (
      <div
        className="bg-dark px-4 py-3"
        style={{
          borderRadius: 10,
        }}
      >
        <p
          style={{ color: lanesColor[payload?.[0]?.name] }}
          className="font-wt-600 font-size-14 m-0 p-0"
        >{`${cpStats?.revenuePieChartData?.[payload?.[0]?.name]?.["type"]
          } - $ ${Intl.NumberFormat("en-US", { notation: "compact" }).format(
            cpStats?.revenuePieChartData?.[payload?.[0]?.name]?.["value"]
          )}`}</p>
      </div>
    );
  };

  const CustomTooltipForCPReferal = ({ payload }) => {
    return (
      <div
        className="bg-dark px-4 py-3"
        style={{
          borderRadius: 10,
        }}
      >
        <p
          style={{ color: lanesColor2[payload?.[0]?.name] }}
          className="font-wt-600 font-size-14 m-0 p-0"
        >{`${cpStats?.referalPieChartData?.[payload?.[0]?.name]?.["type"]
          } - ${Intl.NumberFormat("en-US", { notation: "compact" }).format(
            cpStats?.referalPieChartData?.[payload?.[0]?.name]?.["value"]
          )}`}</p>
      </div>
    );
  };

  const CustomTooltipForCPLimit = ({ payload }) => {
    return (
      <div
        className="bg-dark px-4 py-3"
        style={{
          borderRadius: 10,
        }}
      >
        <p
          style={{ color: lanesColor3[payload?.[0]?.name] }}
          className="font-wt-600 font-size-14 m-0 p-0"
        >{`${cpStats?.limitPieChartData?.[payload?.[0]?.name]?.["type"]
          } - $ ${Intl.NumberFormat("en-US", { notation: "compact" }).format(
            cpStats?.limitPieChartData?.[payload?.[0]?.name]?.["value"]
          )}`}</p>
      </div>
    );
  };

  const CustomTooltipForCPFinance = ({ payload }) => {
    return (
      <div
        className="bg-dark px-4 py-3"
        style={{
          borderRadius: 10,
        }}
      >
        <p
          style={{ color: lanesColor4[payload?.[0]?.name] }}
          className="font-wt-600 font-size-14 m-0 p-0"
        >{`${cpStats?.financePieChartData?.[payload?.[0]?.name]?.["type"]
          } - $ ${Intl.NumberFormat("en-US", { notation: "compact" }).format(
            cpStats?.financePieChartData?.[payload?.[0]?.name]?.["value"]
          )}`}</p>
      </div>
    );
  };

  const CustomTooltipForCPDisbursement = ({ payload }) => {
    return (
      <div
        className="bg-dark px-4 py-3"
        style={{
          borderRadius: 10,
        }}
      >
        <p
          style={{ color: lanesColor5[payload?.[0]?.name] }}
          className="font-wt-600 font-size-14 m-0 p-0"
        >{`${cpStats?.disbursementPieChartData?.[payload?.[0]?.name]?.["type"]
          } - $ ${Intl.NumberFormat("en-US", { notation: "compact" }).format(
            cpStats?.disbursementPieChartData?.[payload?.[0]?.name]?.["value"]
          )}`}</p>
      </div>
    );
  };

  const EventComponent = ({
    imglink,
    eventname,
    eventTime,
    eventdescription,
  }) => {
    return (
      <>
        <div
          className="card"
          style={{
            width: "30rem",
            marginLeft: "1rem",
            marginRight: "2rem",
            marginTop: "4rem",
            marginBottom: "4rem",
          }}
        >
          <img
            src={imglink}
            style={{ height: "13rem" }}
            className="card-img-top "
            alt="..."
          />
          <div className="card-body">
            <h5 className="card-title ">{eventname}</h5>
            <h6>{eventTime}</h6>
            <p className="card-text">{eventdescription}</p>
            <a href="#" className="color-primary">
              Read more
            </a>
          </div>
        </div>
      </>
    );
  };

  const dataTable = [
    ["John Doe", "Type A", "Stage 1", "Lorem ipsum", "2 days", "Action"],
    ["Jane Smith", "Type B", "Stage 2", "Dolor sit amet", "5 days", "Action"],
    ["Jane Smith", "Type B", "Stage 2", "Dolor sit amet", "5 days", "Action"],
    ["Jane Smith", "Type B", "Stage 2", "Dolor sit amet", "5 days", "Action"],
    ["Jane Smith", "Type B", "Stage 2", "Dolor sit amet", "5 days", "Action"],
    ["Jane Smith", "Type B", "Stage 2", "Dolor sit amet", "5 days", "Action"],
    // Add more rows as needed
  ];

  const lanesColor = ["#E8AF7B", "#98BCDE", "#FDB601", "#F887E0"];
  const [applicationCounts, setApplicationCounts] = useState([]);
  const [applicationStatus, setApplicationStatus] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalCount2, setTotalCount2] = useState(0);
  const [limitsum, setlimitsum] = useState({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!loaded) {
      // Check if functions are not already called

      loadApplicationCounts();
      fetchApplicationCounts();
      limitSumQuote();
      limitSumQuoteUsed();
      financelimitSum();

      BuyerTableData();
      setLoaded(true); // Mark functions as called
    }
  }, [loaded]);

  async function loadApplicationCounts() {
    setshowLoader(true);
    let apiResp = await call("POST", "limitdistribution", { userId });
    const dataArray = Object.entries(apiResp).map(([type, value]) => ({
      type,
      value,
    }));
    const newdata = dataArray.filter((item) => {
      if (
        item.type === "Total Limit" ||
        item.type === "Available" ||
        item.type === "Used"
      ) {
        setTotalCount((val) => val + item.value);

        return item;
      }
    });
    console.log(newdata, "newdataa");
    setApplicationCounts(newdata);
    setshowLoader(false);
  }
  async function fetchApplicationCounts() {
    try {
      const res = await call("POST", "getIDApprovedApplicationCounts", {
        userId,
      });

      const newdata = Object.entries(res)
        .filter(
          ([type]) =>
            type === "receivable" ||
            type === "overdue12Week" ||
            type === "due12Week"
        )
        .map(([type, value]) => {
          let newName =
            type === "receivable"
              ? "Received"
              : type === "overdue12Week"
                ? "Overdue"
                : "Due";
          return { type: newName, value };
        });

      newdata.forEach(({ type, value }) => {
        if (type === "Received" || type === "Overdue" || type === "Due") {
          setTotalCount2((val) => val + value);
        }
      });

      setApplicationStatus(newdata);
    } catch (error) {
      console.error("Error fetching application counts:", error);
    }
  }

  const [newval, setnewval] = useState([]);
  const [limitTotal, setlimitTotal] = useState(0);
  const [financesum, setfinancesum] = useState([]);
  const [financetotal, setfinancetotal] = useState(0);
  async function limitSumQuote() {
    try {
      const res = await call("POST", "getTotalLimitSumFromQuotes", { userId });
      setlimitsum((prevState) => ({
        ...prevState,
        "Total Limit Available": res.totallimitavailable,
      }));
      setnewval((prevState) => [
        ...prevState,
        { type: "Available", value: res.totallimitavailable },
      ]);
      setlimitTotal(res.totallimitavailable);
    } catch (error) {
      console.error("Error occurred while fetching total limit sum:", error);
    }
  }

  async function limitSumQuoteUsed() {
    try {
      const res = await call("POST", "getLCApplyForFinanceApplicationCounts", {
        userId,
      });
      setnewval((prevState) => [
        ...prevState,
        { type: "Used", value: res.TotallimitUsed },
      ]);
    } catch (error) {
      console.error("Error occurred while fetching total limit sum:", error);
    }
  }

  useEffect(() => {
    if (newval.length >= 2 && newval.length < 3) {
      const leftValue = newval[0]?.value ?? 0;
      const rightValue = newval[1]?.value ?? 0;
      setnewval((prevState) => [
        ...prevState,
        { type: "Left", value: leftValue - rightValue },
      ]);
    }
  }, [newval]);

  async function financelimitSum() {
    try {
      const res = await call("POST", "getFinanceAppliedSum", { userId });
      setfinancesum((prevState) => [
        ...prevState,
        { type: "Approved", value: res.totalfinanceapproved },
      ]);
      setfinancesum((prevState) => [
        ...prevState,
        { type: "Rejected", value: res.totalfinancerejected },
      ]);
      const total = res.totalfinancerejected + res.totalfinanceapproved;
      setfinancetotal(total);
    } catch (error) {
      console.error("Error occurred while fetching total limit sum:", error);
    }
  }

  const [transformedtableData, setTransformedTableData] = useState([]);

  async function BuyerTableData() {
    try {
      const data = await call("POST", "buyerStages", { userId });
      const uniqueBuyers = {};
      const sortedDetails = data.details.sort(
        (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
      );
      const latestSixDetails = sortedDetails.slice(0, 6);
      latestSixDetails.forEach((detail) => {
        const buyerName = detail["Buyer's Name"];
        if (!uniqueBuyers[buyerName]) {
          uniqueBuyers[buyerName] = detail;
        }
      });
      setTransformedTableData(formatDataForTable(latestSixDetails));
    } catch (error) {
      console.error("Error occurred while fetching total limit sum:", error);
    }
  }

  function formatDataForTable(data) {
    try {
      let tableData = [];
      for (let index = 0; index < data.length; index++) {
        const item = data[index];
        let row = [];

        row[0] = item["Buyer's Name"];
        row[1] = item["Service Type"];
        row[2] = item["Stage"];
        row[3] = (
          <button
            type="button"
            className={`btn btn-color`}
            onClick={() => {
              window.location = `/${item.Action}?search=${row[0]}`;
            }}
          >
            {item.Action}
          </button>
        );

        tableData.push(row);
      }
      return tableData;
    } catch (error) {
      console.log("Error in formatDataForTable:", error);
      return [];
    }
  }

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

      <div className="container-fluid">
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

        <div className="row">
          <SideBarV2 state="dashboard" userTokenDetails={userTokenDetails} />
          <main
            role="main"
            className={
              "ml-sm-auto col-lg-10 " +
              (navToggleState.status ? " expanded-right" : "")
            }
            id="app-main-div"
          >
            <HeaderV2
              title={"Dashboard"}
              userTokenDetails={userTokenDetails}
              isFilter={userTypeId / 1 == 20}
              timeFilter={userTypeId / 1 == 20}
              downloadOption={userTypeId / 1 == 20}
              onChangeFilterData={(e) => {
                setFilter({ ...filter, [e.target.name]: e.target.value });
              }}
              filterData={filter}
              referalCode={userTypeId / 1 == 20}
              onRefresh={() => setRefresh(refresh + 1)}
            />

            {userTypeId / 1 == 20 ? (
              <div className="my-4">
                <div className="d-flex justify-content-between">
                  <div className="card w-49 d-flex  align-items-center p-3">
                    <label className="font-size-14 font-wt-500">
                      Revenue{" "}
                      {`for - ${moment(filter.timeFilterFrom).format(
                        "MMMM"
                      )} ${moment(filter.timeFilterFrom).format("YYYY")}`}
                    </label>
                    <div
                      style={{ marginTop: "-7rem", height: "19rem" }}
                      className="position-relative"
                    >
                      <PieChartComponent
                        pieContainerLeft={"4.7rem"}
                        customToolTip={<CustomTooltipForCPRevenue />}
                        data={cpStats.revenuePieChartData || []}
                        dataKey="value"
                        colors={lanesColor}
                        cornerRadius={30}
                        totalVal={cpStats.totalRevenue}
                      />
                    </div>
                    <div className="mx-4">
                      <NewTablev2 columns={[]}>
                        {lanesColor.map((i, j) => {
                          return (
                            <tr>
                              <td>
                                <div
                                  style={{
                                    height: "1.5rem",
                                    width: "2.5rem",
                                    background: i,
                                  }}
                                />
                              </td>
                              <td>
                                <label className="font-size-14 font-wt-400 text-break">
                                  {lanesName[j]}
                                </label>
                              </td>
                              <td>
                                <label className="font-size-14 font-wt-400 text-break">{`${getPercentage(
                                  cpStats.revenuePieChartData?.[j]?.["value"],
                                  cpStats.totalRevenue
                                )}%`}</label>
                              </td>
                              <td>
                                <label className="font-size-14 font-wt-400 text-break">{`$ ${Intl.NumberFormat(
                                  "en",
                                  { notation: "compact" }
                                ).format(
                                  cpStats.revenuePieChartData?.[j]?.["value"]
                                )}`}</label>
                              </td>
                            </tr>
                          );
                        })}
                      </NewTablev2>
                    </div>
                  </div>
                  <div className="card w-49 d-flex align-items-center p-3">
                    <label className="font-size-14 font-wt-500">Referral</label>
                    <div
                      style={{ marginTop: "-7rem", height: "19rem" }}
                      className="position-relative"
                    >
                      <PieChartComponent
                        hideDollar
                        pieContainerLeft={"4.7rem"}
                        customToolTip={<CustomTooltipForCPReferal />}
                        data={cpStats.referalPieChartData || []}
                        dataKey="value"
                        colors={lanesColor2}
                        cornerRadius={30}
                        totalVal={cpStats.totalReferals}
                      />
                    </div>
                    <div className="mx-5">
                      <NewTablev2 columns={[]}>
                        {lanesColor2.map((i, j) => {
                          return (
                            <tr>
                              <td>
                                <div
                                  style={{
                                    height: "1.5rem",
                                    width: "2.5rem",
                                    background: i,
                                  }}
                                />
                              </td>
                              <td>
                                <label className="font-size-14 font-wt-400 text-break">
                                  {lanesName2[j]}
                                </label>
                              </td>
                              <td>
                                <label className="font-size-14 font-wt-400 text-break">{`${getPercentage(
                                  cpStats.referalPieChartData?.[j]?.["value"],
                                  cpStats.totalReferals
                                )}%`}</label>
                              </td>
                              <td>
                                <label className="font-size-14 font-wt-400 text-break">
                                  {Intl.NumberFormat("en", {
                                    notation: "compact",
                                  }).format(
                                    cpStats.referalPieChartData?.[j]?.["value"]
                                  )}
                                </label>
                              </td>
                            </tr>
                          );
                        })}
                      </NewTablev2>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}

            {userTypeId / 1 == 20 ? (
              <div className="my-4">
                <div className="d-flex justify-content-between">
                  <div className="card w-32 d-flex  align-items-center p-3">
                    <div
                      style={{ marginTop: "-7rem", height: "19rem" }}
                      className="position-relative"
                    >
                      <PieChartComponent
                        pieContainerLeft={"4.7rem"}
                        customToolTip={<CustomTooltipForCPLimit />}
                        data={cpStats.limitPieChartData || []}
                        dataKey="value"
                        colors={lanesColor3}
                        cornerRadius={30}
                        totalVal={cpStats.totalLimit}
                      />
                    </div>
                    <label className="font-size-14 font-wt-500">Limit</label>
                    <div className="mx-0">
                      <NewTablev2 columns={[]}>
                        {lanesColor3.map((i, j) => {
                          return (
                            <tr>
                              <td>
                                <div
                                  style={{
                                    height: "1.5rem",
                                    width: "2.5rem",
                                    background: i,
                                  }}
                                />
                              </td>
                              <td>
                                <label className="font-size-14 font-wt-400">
                                  {lanesName3[j]}
                                </label>
                              </td>
                              <td>
                                <label className="font-size-14 font-wt-400 text-break">{`${getPercentage(
                                  cpStats.limitPieChartData?.[j]?.["value"],
                                  cpStats.totalLimit
                                )}%`}</label>
                              </td>
                              <td>
                                <label className="font-size-14 font-wt-400 text-break">{`$ ${Intl.NumberFormat(
                                  "en",
                                  { notation: "compact" }
                                ).format(
                                  cpStats.limitPieChartData?.[j]?.["value"]
                                )}`}</label>
                              </td>
                            </tr>
                          );
                        })}
                      </NewTablev2>
                    </div>
                  </div>
                  <div className="card w-32 d-flex align-items-center p-3">
                    <div
                      style={{ marginTop: "-7rem", height: "19rem" }}
                      className="position-relative"
                    >
                      <PieChartComponent
                        pieContainerLeft={"4.7rem"}
                        customToolTip={<CustomTooltipForCPFinance />}
                        data={cpStats.financePieChartData || []}
                        dataKey="value"
                        colors={lanesColor4}
                        cornerRadius={30}
                        totalVal={cpStats.totalFinance}
                      />
                    </div>
                    <label className="font-size-14 font-wt-500">Finance</label>
                    <div className="mx-0">
                      <NewTablev2 columns={[]}>
                        {lanesColor4.map((i, j) => {
                          return (
                            <tr>
                              <td>
                                <div
                                  style={{
                                    height: "1.5rem",
                                    width: "2.5rem",
                                    background: i,
                                  }}
                                />
                              </td>
                              <td>
                                <label className="font-size-14 font-wt-400">
                                  {lanesName4[j]}
                                </label>
                              </td>
                              <td>
                                <label className="font-size-14 font-wt-400 text-break">{`${getPercentage(
                                  cpStats.financePieChartData?.[j]?.["value"],
                                  cpStats.totalFinance
                                )}%`}</label>
                              </td>
                              <td>
                                <label className="font-size-14 font-wt-400 text-break">{`$ ${Intl.NumberFormat(
                                  "en",
                                  { notation: "compact" }
                                ).format(
                                  cpStats.financePieChartData?.[j]?.["value"]
                                )}`}</label>
                              </td>
                            </tr>
                          );
                        })}
                      </NewTablev2>
                    </div>
                  </div>
                  <div className="card w-32 d-flex align-items-center p-3">
                    <div
                      style={{ marginTop: "-7rem", height: "19rem" }}
                      className="position-relative"
                    >
                      <PieChartComponent
                        pieContainerLeft={"4.7rem"}
                        customToolTip={<CustomTooltipForCPDisbursement />}
                        data={cpStats.disbursementPieChartData || []}
                        dataKey="value"
                        colors={lanesColor5}
                        cornerRadius={30}
                        totalVal={cpStats.totalDisbursement}
                      />
                    </div>
                    <label className="font-size-14 font-wt-500">
                      Disbursement
                    </label>
                    <div className="mx-0">
                      <NewTablev2 columns={[]}>
                        {lanesColor5.map((i, j) => {
                          return (
                            <tr>
                              <td>
                                <div
                                  style={{
                                    height: "1.5rem",
                                    width: "2.5rem",
                                    background: i,
                                  }}
                                />
                              </td>
                              <td>
                                <label className="font-size-14 font-wt-400">
                                  {lanesName5[j]}
                                </label>
                              </td>
                              <td>
                                <label className="font-size-14 font-wt-400 text-break">{`${getPercentage(
                                  cpStats.disbursementPieChartData?.[j]?.[
                                  "value"
                                  ],
                                  cpStats.totalDisbursement
                                )}%`}</label>
                              </td>
                              <td>
                                <label className="font-size-14 font-wt-400 text-break">{`$ ${Intl.NumberFormat(
                                  "en",
                                  { notation: "compact" }
                                ).format(
                                  cpStats.disbursementPieChartData?.[j]?.[
                                  "value"
                                  ]
                                )}`}</label>
                              </td>
                            </tr>
                          );
                        })}
                      </NewTablev2>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}

            {tab / 1 == 1 && userTypeId / 1 != 20 && userTypeId / 1 != 5 && (
              <div className="">
                {/* 
              <div className='card p-3 dashboard-card border-0 borderRadius'>
                <Stats StatsData={supplierCountdata} />
              </div> */}
                {/* <div className="d-flex justify-content-start">
                  <button
                    className="btn btn-secondary mr-2"
                    style={{
                      backgroundColor: "white",
                      borderColor: "#adb5bd", 
                      color: "black",
                      paddingLeft: "2rem",
                      paddingRight: "2rem",
                      border: "1px solid #adb5bd", 
                      marginLeft: "1rem",
                    }}
                  >
                    Search
                  </button>

                 

                  <button
                    className="btn btn-secondary mr-2"
                    style={{
                      backgroundColor: "white",
                      borderColor: "#adb5bd",
                      color: "black",
                      paddingLeft: "2rem",
                      paddingRight: "2rem",
                      border: "1px solid #adb5bd", 
                      marginLeft: "1rem",
                    }}
                  >
                    Download
                  </button>

                  <button
                    className="btn btn-secondary mr-2"
                    style={{
                      backgroundColor: "white",
                      borderColor: "#adb5bd", 
                      color: "black",
                      paddingLeft: "2rem",
                      paddingRight: "2rem",
                      border: "1px solid #adb5bd", 
                      marginLeft: "1rem",
                    }}
                  >
                    Table View
                  </button>

                  <button
                    className="btn btn-secondary mr-2"
                    style={{
                      backgroundColor: "white",
                      borderColor: "#adb5bd",
                      color: "black",
                      paddingLeft: "2rem",
                      paddingRight: "2rem",
                      border: "1px solid #adb5bd",
                      marginLeft: "1rem",
                    }}
                  >
                    This Month
                  </button>
                </div> */}

                <div className="row mt-5 justify-content-between">
                  <div className="col">
                    {/* <Details DetailsData={SupplierDetailsData} userTokenDetails={userTokenDetails} /> */}
                    <div className="">
                      <TaskUpdate
                        userTokenDetails={userTokenDetails}
                        navToggleState={navToggleState}
                      />
                    </div>
                  </div>
                </div>
                <div className="container mt-4 mb-4">
                  <div className="row">
                    <div className="col-md-4">
                      <div className="row donut-box" style={{ height: "100%" }}>
                        <div
                          className="col-md-12 text-center"
                          style={{ marginBottom: "-24rem", marginTop: "4rem" }}
                        >
                          <label className="font-size-16 font-wt-600">
                            {"Limit"}
                          </label>
                        </div>
                        <div className="col-md-12 d-flex flex-column align-items-center">
                          <div
                            className="col-md-12 mb-3 d-flex "
                            style={{ marginLeft: "5rem" }}
                          >
                            {applicationCounts.length > 0 && totalCount > 0 ?
                              <PieChartComponent
                                hideDollar={true}
                                data={applicationCounts}
                                dataKey="value"
                                colors={lanesColor}
                                cornerRadius={30}
                                totalVal={totalCount}
                              /> : (
                                <div
                                  style={{
                                    width: "80%",
                                    height: "300px",
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",

                                  }}
                                >
                                  <span style={{ fontSize: "1.2rem", color: "#999" }}>Not Available</span>
                                </div>
                              )}
                          </div>
                          <div
                            className="col-md-12"
                            style={{ marginTop: "-4rem" }}
                          >
                            {applicationCounts?.length ? (
                              <table className="table">
                                <tbody>
                                  {applicationCounts.map((i, index) => (
                                    <tr key={index}>
                                      <td>
                                        <div
                                          style={{
                                            width: "20px",
                                            height: "20px",
                                            backgroundColor: lanesColor[index],
                                          }}
                                        ></div>
                                      </td>
                                      <td>{i.type}</td>
                                      <td>{i.value}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="col-md-4">
                      <div className="row donut-box" style={{ height: "100%" }}>
                        <div
                          className="col-md-12 text-center"
                          style={{ marginBottom: "-24rem", marginTop: "4rem" }}
                        >
                          <label className="font-size-16 font-wt-600">
                            {"Disbursement"}
                          </label>
                        </div>
                        {/* <div className="col-md-12 d-flex flex-column align-items-center">
                          <div
                            className="col-md-12 mb-3 d-flex "
                            style={{ marginLeft: "5rem" }}
                          >
                            <PieChartComponent
                              hideDollar={true}
                              data={applicationStatus}
                              dataKey="value"
                              colors={lanesColor}
                              cornerRadius={30}
                              totalVal={totalCount2}
                            />
                          </div>
                          <div
                            className="col-md-12"
                            style={{ marginTop: "-4rem" }}
                          >
                            {applicationStatus?.length ? (
                              <table className="table">
                                <tbody>
                                  {applicationStatus.map((i, index) => (
                                    <tr key={index}>
                                      <td>
                                        <div
                                          style={{
                                            width: "20px",
                                            height: "20px",
                                            backgroundColor: lanesColor[index],
                                          }}
                                        ></div>
                                      </td>
                                      <td>{i.type}</td>
                                      <td>{i.value}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            ) : null}
                          </div>
                        </div> */}
                        <div className="col-md-12 d-flex flex-column align-items-center">
                          <div
                            className="col-md-12 mb-3 d-flex"
                            style={{ marginLeft: "5rem", minHeight: "300px", width: "100%" }} // Ensure fixed height and width
                          >
                            {applicationStatus?.length && totalCount2 > 0 ? (
                              <PieChartComponent
                                hideDollar={true}
                                data={applicationStatus}
                                dataKey="value"
                                colors={lanesColor}
                                cornerRadius={30}
                                totalVal={totalCount2}
                              />
                            ) : (
                              <div
                                style={{
                                  width: "80%",
                                  height: "300px",
                                  display: "flex",
                                  justifyContent: "center",
                                  alignItems: "center",

                                }}
                              >
                                <span style={{ fontSize: "1.2rem", color: "#999" }}>Not Available</span>
                              </div>
                            )}
                          </div>

                          <div className="col-md-12" style={{ marginTop: "-4rem" }}>
                            {applicationStatus?.length && totalCount2 > 0 && (
                              <table className="table">
                                <tbody>
                                  {applicationStatus.map((i, index) => (
                                    <tr key={index}>
                                      <td>
                                        <div
                                          style={{
                                            width: "20px",
                                            height: "20px",
                                            backgroundColor: lanesColor[index],
                                          }}
                                        ></div>
                                      </td>
                                      <td>{i.type}</td>
                                      <td>{i.value}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            )}
                          </div>
                        </div>

                      </div>
                    </div>

                    <div className="col-md-4">
                      <div className="row donut-box" style={{ height: "100%" }}>
                        <div
                          className="col-md-12 text-center"
                          style={{ marginBottom: "-24rem", marginTop: "4rem" }}
                        >
                          <label className="font-size-16 font-wt-600">
                            {"Buyers"}
                          </label>
                        </div>
                        {/* <div className="col-md-12 d-flex flex-column align-items-center">
                          <div
                            className="col-md-12 mb-3 d-flex "
                            style={{ marginLeft: "5rem" }}
                          >
                            <PieChartComponent
                              hideDollar={true}
                              data={newval}
                              dataKey="value"
                              colors={lanesColor}
                              cornerRadius={30}
                              totalVal={limitTotal}
                            />
                          </div>
                          <div
                            className="col-md-12"
                            style={{ marginTop: "-4rem" }}
                          >
                            {newval?.length ? (
                              <table className="table">
                                <tbody>
                                  {newval.map((i, index) => (
                                    <tr key={index}>
                                      <td>
                                        <div
                                          style={{
                                            width: "20px",
                                            height: "20px",
                                            backgroundColor: lanesColor[index],
                                          }}
                                        ></div>
                                      </td>
                                      <td>{i.type}</td>
                                      <td>{i.value}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            ) : null}
                          </div>
                        </div> */}

                        <div className="col-md-12 d-flex flex-column align-items-center">
                          <div className="col-md-12 mb-3 d-flex" style={{ marginLeft: "5rem" }}>
                            {newval?.length && limitTotal > 0 ? (
                              <PieChartComponent
                                hideDollar={true}
                                data={newval}
                                dataKey="value"
                                colors={lanesColor}
                                cornerRadius={30}
                                totalVal={limitTotal}
                              />
                            ) : (
                              <div
                                style={{
                                  width: "80%",
                                  height: "300px",
                                  display: "flex",
                                  justifyContent: "center",
                                  alignItems: "center",

                                }}
                              >
                                <span style={{ fontSize: "1.2rem", color: "#999" }}>Not Available</span>
                              </div>
                            )}
                          </div>
                          <div className="col-md-12" style={{ marginTop: "-4rem" }}>
                            {newval?.length && limitTotal > 0 && (
                              <table className="table">
                                <tbody>
                                  {newval.map((i, index) => (
                                    <tr key={index}>
                                      <td>
                                        <div
                                          style={{
                                            width: "20px",
                                            height: "20px",
                                            backgroundColor: lanesColor[index],
                                          }}
                                        ></div>
                                      </td>
                                      <td>{i.type}</td>
                                      <td>{i.value}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            )
                            }
                          </div>
                        </div>

                      </div>
                    </div>

                    <div className="col-md-4 mt-2">
                      <div className="row donut-box" style={{ height: "100%" }}>
                        <div
                          className="col-md-12 text-center"
                          style={{ marginBottom: "-24rem", marginTop: "4rem" }}
                        >
                          <label className="font-size-16 font-wt-600">
                            {"Finance"}
                          </label>
                        </div>
                        <div className="col-md-12 d-flex flex-column align-items-center">
                          <div
                            className="col-md-12 mb-3 d-flex "
                            style={{ marginLeft: "5rem" }}
                          >
                            {financesum?.length && financetotal > 0 ? (<PieChartComponent
                              hideDollar={true}
                              data={financesum}
                              dataKey="value"
                              colors={lanesColor}
                              cornerRadius={30}
                              totalVal={financetotal}
                            />) : (
                              <div
                                style={{
                                  width: "80%",
                                  height: "300px",
                                  display: "flex",
                                  justifyContent: "center",
                                  alignItems: "center",

                                }}
                              >
                                <span style={{ fontSize: "1.2rem", color: "#999" }}>Not Available</span>
                              </div>
                            )}
                          </div>
                          <div
                            className="col-md-12"
                            style={{ marginTop: "-4rem" }}
                          >
                            {financesum?.length && financetotal > 0 && (
                              <table className="table">
                                <tbody>
                                  {financesum.map((i, index) => (
                                    <tr key={index}>
                                      <td>
                                        <div
                                          style={{
                                            width: "20px",
                                            height: "20px",
                                            backgroundColor: lanesColor[index],
                                          }}
                                        ></div>
                                      </td>
                                      <td>{i.type}</td>
                                      <td>{i.value}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mx-3 my-4 mt-4">
                  <NewTable
                    disableAction={true}
                    columns={[
                      {
                        name: "Buyer's Name",
                      },
                      { name: "Service Type" },
                      { name: "Stage" },
                      {
                        name: "Action",
                      },
                    ]}
                    data={transformedtableData}
                  />
                </div>

                {/* <div className="d-flex col">
                  <EventComponent
                    imglink={
                      "https://m.economictimes.com/thumb/msid-82256722,width-1200,height-900,resizemode-4,imgsize-1182873/exports-getty.jpg"
                    }
                    eventname={"Event Name"}
                    eventTime={"10-2-2022 19:00PM"}
                    eventdescription={
                      "Hers a litle description of the upcoming event. PLease make sure that you have registered int he event."
                    }
                  />

                  <EventComponent
                    imglink={
                      "https://niftindia.in/blog/images-b/blog/full/10.jpg"
                    }
                    eventname={"Event Name"}
                    eventTime={"10-2-2022 19:00PM"}
                    eventdescription={
                      "Hers a litle description of the upcoming event. PLease make sure that you have registered int he event."
                    }
                  />
                  <EventComponent
                    imglink={
                      "https://digest.myhq.in/wp-content/uploads/2022/12/Export-Business-Ideas-in-India.png"
                    }
                    eventname={"Event Name"}
                    eventTime={"10-2-2022 19:00PM"}
                    eventdescription={
                      "Hers a litle description of the upcoming event. PLease make sure that you have registered int he event."
                    }
                  />
                </div> */}

                {/* <div className="card p-3 dashboard-card border-0 borderRadius mt-4">
                <div className="d-flex justify-content-evenly align-items-center">
                  <div className="w-30">
                    <p className="font-wt-500 letter-spacing05 text-color-0C0C0C font-size-14 lineheight19 mb-0 d-none">Letter of Credit</p>
                  </div>
                  <div className='w-30 d-flex gap-3 align-items-center'>
                    <p className='mb-0 text-color-0C0C0C letter-spacing05 lh-22 font-wt-600 font-size-16'>Summary</p>
                    <div class="dropdown">
                      <button class="form-select border-0 monthsingraph" id="dropdownMenuButton1" data-bs-toggle="dropdown" aria-expanded="false">
                        2017 - 2022
                      </button>
                      <ul class="dropdown-menu financedropdown borderEEEEEE borderRadius border-0" aria-labelledby="dropdownMenuButton1">
                        <li><a class="dropdown-item">This month</a></li>
                        <li><a class="dropdown-item">This year</a></li>
                        <li><a class="dropdown-item"> Custom date</a></li>
                        <li><a class="dropdown-item">Buyer</a></li>
                        <li><a class="dropdown-item">HSN code</a></li>
                        <li><a class="dropdown-item border-0">Product</a></li>
                      </ul>
                    </div>
                  </div>
                  <div className="w-30 d-flex gap-3 justify-content-center">
                    <p className="text-color-0C0C0C letter-spacing05 lh-16 font-wt-300 font-size-12 mb-0" ><span className="bgAED8FF Financelimitapplied me-2"></span> Shipments</p>
                    <p className="text-color-0C0C0C letter-spacing05 lh-16 font-wt-300 font-size-12 mb-0" ><span className="bg76EEA9 Financelimitapplied me-2"></span> Finance</p>
                  </div>
                </div>
                <ResponsiveContainer width={"100%"}
                  height={300}>
                  <LineChart
                    width={500}
                    height={300}
                    data={graphdata}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 5
                    }}
                  >
                    <XAxis dataKey="year" type="category" />
                    <YAxis type="number" />
                    <Tooltip />
                    <Line dataKey="shipments" stroke="#AED8FF" strokeWidth={"2px"} />
                    <Line dataKey="finance" stroke="#76EEA9" strokeWidth={"2px"} />
                  </LineChart>
                </ResponsiveContainer>
              </div> */}
              </div>
            )}
            {tab / 1 == 2 && userTypeId / 1 != 20 && userTypeId / 1 != 5 && (
              <div className="">
                <div className="card p-3 dashboard-card border-0 borderRadius">
                  <Stats StatsData={FinCountdata} />
                </div>
                <div className="row mt-5 justify-content-between">
                  <div className="w-70 pr-4">
                    <Details
                      DetailsData={FinancerDetailsData}
                      userTokenDetails={userTokenDetails}
                    />
                    <div className="">
                      {/* <TaskUpdate userTokenDetails={userTokenDetails} navToggleState={navToggleState} /> */}
                      <FinancerDv2Taskupdate
                        userTokenDetails={userTokenDetails}
                      />
                    </div>
                  </div>
                  <div className="w-30 pl-3">
                    <div className="card p-1">
                      <Calendar
                        onChange={(val) => {
                          console.log("oncHANGEVALLLLLLLLLLLL", val);
                          setReminderDate(val);
                        }}
                        // value={[new Date(filterData["Date"]["value"][0]), new Date(filterData["Date"]["value"][1])]}
                        className=" border-0  col-md-12"
                        next2Label={null}
                        rev2Label={null}
                        // selectRange={true}
                        calendarType={"US"}
                      />
                      <div>
                        <label className="font-size-13 font-wt-500 text-color-0C0C0C pl-4 pt-3">{`${moment(reminderDate).format("YYYY-MM-DD") ===
                          moment().format("YYYY-MM-DD")
                          ? "Today's"
                          : "Day's"
                          } Reminder`}</label>
                        <div className="pl-4 pb-2">
                          {reminders.length ? (
                            reminders.map((i, j) => {
                              return (
                                <div
                                  className="d-flex align-items-center pt-2"
                                  style={{ borderBottom: "1px solid #EEEEEE" }}
                                >
                                  {i.invRefNo ? (
                                    <label className="font-size-13 font-wt-400 text-color-0C0C0C w-90">{`Disbursement scheduled - Invoice Discounting - ${i.currency
                                      } ${Intl.NumberFormat("en", {
                                        notation: "compact",
                                      }).format(i.amount)} - ${i.invRefNo
                                      }`}</label>
                                  ) : (
                                    <label className="font-size-13 font-wt-400 text-color-0C0C0C w-90">{`${i.meetingType / 1 == 0 ? "Audio" : "Video"
                                      } Call - ${moment(
                                        i.meetingstartTime
                                      ).format("hh:mm a")} - ${i.meetingTitle
                                      }`}</label>
                                  )}
                                  <div>
                                    <img
                                      className="cursor"
                                      onClick={() => {
                                        if (i.invRefNo) {
                                          window.location = `/disbursementV2?search=${encodeURI(
                                            i.invRefNo
                                          )}`;
                                        } else {
                                          window.location = "/ChatRoomV2";
                                        }
                                      }}
                                      src="assets/images/open-link.png"
                                    />
                                  </div>
                                </div>
                              );
                            })
                          ) : (
                            <label className="font-size-13 font-wt-500 text-secondary">{`No Reminders for Day`}</label>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* <div className='col-md-4 ps-4'>
                  <div className='card p-4 h-100 dashboard-card border-0 borderRadius'>
                    <CalendarTab />
                  </div>
                </div> */}
                </div>
                <div className="row">
                  <div className="col-md-6 pe-5">
                    <div
                      className="card p-4 dashboard-card border-0 borderRadius mt-4"
                      style={{ height: "324px" }}
                    >
                      <div className="d-flex align-items-center">
                        <div className="">
                          <p className="font-wt-500 letter-spacing05 text-color-0C0C0C font-size-14 lineheight19 mb-0 d-none">
                            Letter of Credit
                          </p>
                        </div>
                        <div className=" d-flex gap-3 align-items-center">
                          <p className="mb-0 color3DB16F letter-spacing05 lh-22 font-wt-600 font-size-14">
                            Finance disbursed
                          </p>
                          <div class="dropdown">
                            <button
                              class="form-select border-0 monthsingraph"
                              id="dropdownMenuButton1"
                              data-bs-toggle="dropdown"
                              aria-expanded="false"
                            >
                              2017 - 2022
                            </button>
                            <ul
                              class="dropdown-menu financedropdown borderEEEEEE borderRadius border-0"
                              aria-labelledby="dropdownMenuButton1"
                            >
                              <li>
                                <a class="dropdown-item">This month</a>
                              </li>
                              <li>
                                <a class="dropdown-item">This year</a>
                              </li>
                              <li>
                                <a class="dropdown-item"> Custom date</a>
                              </li>
                              <li>
                                <a class="dropdown-item">Buyer</a>
                              </li>
                              <li>
                                <a class="dropdown-item">HSN code</a>
                              </li>
                              <li>
                                <a class="dropdown-item border-0">Product</a>
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>
                      <FinancerDisbursement data={dischartdata} />
                    </div>
                  </div>
                  <div className="col-md-6 ps-5">
                    <div
                      className="card p-4 dashboard-card border-0 borderRadius mt-4"
                      style={{ height: "324px" }}
                    >
                      <FinancerChart chardata={FinCountdata.slice(4, 6)} />
                      <div className="d-flex justify-content-center">
                        <p className="color95CCFF letter-spacing05 lh-16 font-wt-300 font-size-12 mb-0">
                          <span className="color95CCFF Financelimitapplied me-2"></span>{" "}
                          Finance Due
                        </p>
                        <p className="colorFF6A5A letter-spacing05 lh-16 font-wt-300 font-size-12 mb-0">
                          <span className="colorFF6A5A Financelimitapplied me-2 ml-2"></span>{" "}
                          Finance Disbursed
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {tab / 1 == 3 && userTypeId / 1 != 20 && userTypeId / 1 != 5 && (
              <div>
                <div className="pb-2 d-flex justify-content-between w-100 flex-col-mob">
                  <nav>
                    <div
                      className="nav nav-tabs signdoctabs gap-4 border-0"
                      id="signdoctabs"
                      role="tablist"
                    >
                      <button
                        className={`nav-link  bg-transparent ${AdminTab === "Admin" && "active"
                          } paymenttab`}
                        id="nav-home-tab"
                        data-bs-toggle="tab"
                        type="button"
                        role="tab"
                        aria-controls="nav-home"
                        aria-selected="true"
                        onClick={() => setAdminTab("Admin")}
                      >
                        Admin
                      </button>
                      <button
                        className={`nav-link  bg-transparent ${AdminTab === "CRM" && "active"
                          } paymenttab`}
                        id="nav-contact-tab "
                        data-bs-toggle="tab"
                        type="button"
                        role="tab"
                        aria-controls="nav-contact"
                        aria-selected="false"
                        onClick={() => setAdminTab("CRM")}
                      >
                        CRM
                      </button>
                    </div>
                  </nav>
                  <div className="d-flex gap-3 col-md-5">
                    <div className="col-md-6 w-mob-50">
                      <div className="col-md-12 p-0">
                        <MultipleSelect
                          Id="Select User"
                          Label="Select User"
                          selectedvalue="Select Requirement"
                          optiondata={salesPerson}
                          onChange={(e) =>
                            handleMultiSelectchange(e, "subadmins", "id")
                          }
                          value={data.subadmins ? data.subadmins : []}
                          name="subadmins"
                          labelKey={"contact_person"}
                          valKey={"id"}
                          customStyles={{
                            backgroundColor: "#DEF7FF",
                            borderRadius: "10px",
                          }}
                          isCheckableList={true}
                        />
                      </div>
                    </div>
                    <div className="col-md-6 w-mob-50">
                      <CustomSelect
                        selectData={dateFilters}
                        optionLabel={"val"}
                        optionValue={"name"}
                        onItemCllick={(e) => {
                          if (e === "Custom") {
                            setshowCalendar(true);
                            setselectedDateFilter(e);
                          } else {
                            setselectedDateFilter(e);
                            setshowCalendar(false);
                          }
                        }}
                        removeMb={true}
                        value={selectedDateFilter}
                      />
                      {showCalendar && (
                        <div
                          className="position-absolute dropdownZindex"
                          ref={box}
                          style={{ right: "0px" }}
                        >
                          <Calendar
                            onChange={(val) => {
                              let tempData = [...dateFilters];
                              tempData[7] = {
                                name: "Custom",
                                val: `${moment(val[0]).format(
                                  "DD MMM YY"
                                )} - ${moment(val[1]).format("DD MMM YY")}`,
                              };
                              setdateFillters(tempData);
                              setDateRange({
                                from: moment(val[0]).format("YYYY-MM-DD"),
                                to: moment(val[1]).format("YYYY-MM-DD"),
                              });
                              setshowCalendar(false);
                            }}
                            //value={[new Date(filterData["Date"]["value"][0]), new Date(filterData["Date"]["value"][1])]}
                            className="borderRadius border-0 calenderBorder col-md-12"
                            next2Label={null}
                            rev2Label={null}
                            selectRange={true}
                            calendarType={"US"}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="tab-content d-block" id="nav-tabContent">
                  {AdminTab === "Admin" && (
                    <div
                      className="tab-pane fade show active bg-transparent "
                      id="nav-home"
                      role="tabpanel"
                    >
                      <AdminDashbord
                        userTokenDetails={tokenDetails}
                        dateRange={dateRange}
                        subadmins={data.subadmins}
                      />
                    </div>
                  )}
                  {AdminTab === "CRM" && (
                    <div
                      className="tab-pane fade show active bg-transparent "
                      id="nav-home"
                      role="tabpanel"
                    >
                      <CRMDashboard
                        userTokenDetails={tokenDetails}
                        dateRange={dateRange}
                        subadmins={data.subadmins}
                      />
                    </div>
                  )}
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </>
  );
};

const mapStateToProps = (state) => {
  return {
    navToggleState: state.navToggleState,
    // channelPartnerAccountList: state.channelPartnerAccountList,
    // channelPartnerDisbursedInvoice: state.channelPartnerDisbursedInvoice,
    // channelPartnerRaisedInvoice: state.channelPartnerRaisedInvoice
  };
};

export default connect(mapStateToProps, null)(DashboardV2);
