import { useState } from "react";
import NewTablev2 from "../../utils/newTablev2";
import swal from "sweetalert";

const FeatureTable = ({ title, SaveUserFeatures, features, planFeatures, setPlanFeatures, setSelectedPlan, selectedPlan }) => {
  // console.log("features", planFeatures)
  const [showUnselected, setShowUnselected] = useState(false)
  const [planChanging, setPlanChanging] = useState(false)

  const handleFeatureToggle = (category, featureName) => {
    // Ensure immutability of state updates
    const updatedFeatures = {
      ...planFeatures,
      [category]: {
        ...planFeatures[category],
        [featureName]: !planFeatures[category][featureName],
      },
    };
    console.log("updatedFeatures", planFeatures, updatedFeatures)
    setPlanFeatures(updatedFeatures);
  };




  // Sort the features so that selected ones (true values) appear first
  const sortedFeatures = [...features].sort((a, b) => {
    const featureA = planFeatures[a.category]?.[a.name];
    const featureB = planFeatures[b.category]?.[b.name];

    // Sort selected (true) first, unselected (false) later
    if (featureA && !featureB) return -1;
    if (!featureA && featureB) return 1;
    return 0;
  });

  const handleSelectToggle = () => {
    // setSelectedPlan(title);
    // SaveUserFeatures(title)
    swal({
      title: `Select ${title}?`,
      text: "Are you sure you want to choose this plan?",
      icon: "warning",
      buttons: ["Cancel", "Yes"],
      dangerMode: true,
    }).then((willSelect) => {
      if (willSelect) {
        setSelectedPlan(title);
        SaveUserFeatures(title);
        swal("Success", `${title} plan has been selected!`, "success");
        setPlanChanging(false)
      }
    });


  };
  const handleCustomizeClick = () => {
    setShowUnselected(!showUnselected);
    setPlanChanging(true)
  };

  return (
    <div className={`table-container border mx-2 ${selectedPlan === title ? 'border-success shadow-lg' : ''}`}>
      <div className='d-flex align-items-center justify-content-between mb-2'>
        <h6 className='m-0 p-0'>{title}</h6>
        <button
          className={`new-btn py-2 px-2 ${selectedPlan === title ? 'bg-success' : 'new-btn  '} ${planChanging && "bg-warning"} text-white cursor`}
          onClick={handleSelectToggle}
        >
          {planChanging ? ("Update") : (selectedPlan === title ? 'Selected' : 'Select')}
        </button>
      </div>
      <div className="custom-scrollbar" style={{ maxHeight: "350px", overflowY: "scroll" }}>
        <NewTablev2 columns={[{ subColumns: "Feature", subColumnStyle: { width: '80%' } }, { subColumns: "Select", subColumnStyle: { width: '20%' } }]}>
          {sortedFeatures
            .filter((feature) => planFeatures[feature.category]?.[feature.name] === true || showUnselected)
            .map((feature, index) => {
              const featureValue = planFeatures[feature.category] ? planFeatures[feature.category][feature.name] : null;
              return (
                <tr key={index}>
                  <td>
                    <label className="font-size-14 font-wt-500 text-break">
                      {feature.name}
                    </label>
                  </td>
                  <td>
                    <img
                      className="cursor"
                      onClick={() => handleFeatureToggle(feature.category, feature.name)}
                      src={`assets/images/${featureValue === true ? 'checked_vector' : 'unchecked_vector'}.svg`}
                      height={21}
                      width={21}
                      alt="checkbox"
                    />
                  </td>
                </tr>
              );
            })}
        </NewTablev2>
      </div>
      <div className="d-flex justify-content-between mt-3">
        <button
          className="new-btn py-2 px-2 bg-secondary text-white"
          onClick={handleCustomizeClick}
        >
          {showUnselected ? "Hide Unselected Options" : "Customize"}
        </button>
      </div>
    </div>
  );
};
export default FeatureTable
