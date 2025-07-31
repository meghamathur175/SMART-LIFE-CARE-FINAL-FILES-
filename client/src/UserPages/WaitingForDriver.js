// import React from 'react';
// import { useLocation } from 'react-router-dom';
// import '../styles/WaitingForDriver.css';
// import driverImg from '../images/I2.webp';

// const WaitingForDriver = () => {
//   const { state } = useLocation();
//   const ride = state?.ride;
//   const drivers = ride?.drivers || ride?.assignedDrivers || [];
//   const hospital = state?.hospital;
//   const duration = hospital?.duration || "a few minutes";
//   const ambulanceType = state?.ambulanceType || "Basic";

//   const pickup = ride?.pickup || "Pickup location";
//   const destination = ride?.destination || "Drop location";
//   const fare = ride?.fare ?? "0";

//   return (
//     <div className="waiting-container">
//       {drivers.length > 0 ? (
//         <h1>Drivers Details-:</h1>
//       ) : (
//         <h1>Driver Detail-:</h1>
//       )}
//       <div className="driver-info">
//         {drivers.length > 0 ? (
//           drivers.map((driver, index) => (
//             <div key={index} className="driver-card">
//               <img className="driver-img" src={driverImg} alt="Driver" />
//               <h2 className="driver-name">{driver.name}</h2>
//               <h4 className="vehicle-plate">{driver.ambulancePlateNumber}</h4>
//               <p className="vehicle-model">{ambulanceType}</p>
//               <p className="driver-duration">{duration} away</p>
//               <h3 className="ride-otp">OTP: {driver.otp}</h3>
//               <p className="driver-phone">Phone: {driver.phone}</p>
//               {ride?.driverType && (
//                 <i className="driver-type">
//                   {(ride.driverType ?? ride.status?.toLowerCase()) === 'assigned_by_individual_driver' || ride.driverType === 'IndependentDriver'
//                     ? '(Individual Driver)'
//                     : '(Hospital Driver)'}
//                 </i>
//               )}
//             </div>
//           ))
//         ) : (
//           <p>No driver assigned yet.</p>
//         )}
//       </div>

//       <div className="ride-info">
//         <div className="ride-section">
//           <i className="ri-map-pin-user-fill icon"></i>
//           <div>
//             <h3 className="ride-title">Pickup:</h3>
//             <p className="ride-subtitle">{pickup}</p>
//           </div>
//         </div>

//         <div className="ride-section">
//           <i className="ri-map-pin-2-fill icon"></i>
//           <div>
//             <h3 className="ride-title">Destination:</h3>
//             <p className="ride-subtitle">{destination}</p>
//           </div>
//         </div>

//         <div className="ride-section">
//           <i className="ri-currency-line icon"></i>
//           <div>
//             <h3 className="ride-title">Amount: ₹{fare}</h3>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default WaitingForDriver;




import React from 'react';
import { useLocation } from 'react-router-dom';
import '../styles/WaitingForDriver.css';
import driverImg from '../images/I2.webp';

const WaitingForDriver = () => {
  const { state } = useLocation();
  const ride = state?.ride;
  const drivers = ride?.drivers || ride?.assignedDrivers || [];
  const hospital = state?.hospital;
  const duration = hospital?.duration || "a few minutes";
  const ambulanceType = state?.ambulanceType || "Basic";

  const pickup = ride?.pickup || "Pickup location";
  const destination = ride?.destination || "Drop location";
  const fare = ride?.fare ?? "0";

  return (
    <div className="waiting-container">
      {drivers.length > 0 ? (
        <h1>Drivers Details-:</h1>
      ) : (
        <h1>Driver Detail-:</h1>
      )}

      {/* 🆕 Partial Assignment Message */}
      {ride?.noOfAmbulances && drivers.length < ride.noOfAmbulances && (
        <div className="partial-assignment-warning">
          <p><strong>Note:</strong> Only <strong>{drivers.length}</strong> of <strong>{ride.noOfAmbulances}</strong> ambulances have been assigned so far. Remaining will be assigned shortly.</p>
        </div>
      )}

      <div className="driver-info">
        {drivers.length > 0 ? (
          drivers.map((driver, index) => (
            <div key={index} className="driver-card">
              <img className="driver-img" src={driverImg} alt="Driver" />
              <h2 className="driver-name">{driver.name}</h2>
              <h4 className="vehicle-plate">{driver.ambulancePlateNumber}</h4>
              <p className="vehicle-model">{ambulanceType}</p>
              <p className="driver-duration">{duration} away</p>
              <h3 className="ride-otp">OTP: {driver.otp}</h3>
              <p className="driver-phone">Phone: {driver.phone}</p>
              {ride?.driverType && (
                <i className="driver-type">
                  {(ride.driverType ?? ride.status?.toLowerCase()) === 'assigned_by_individual_driver' || ride.driverType === 'IndependentDriver'
                    ? '(Individual Driver)'
                    : '(Hospital Driver)'}
                </i>
              )}
            </div>
          ))
        ) : (
          <p>No driver assigned yet.</p>
        )}
      </div>

      <div className="ride-info">
        <div className="ride-section">
          <i className="ri-map-pin-user-fill icon"></i>
          <div>
            <h3 className="ride-title">Pickup:</h3>
            <p className="ride-subtitle">{pickup}</p>
          </div>
        </div>

        <div className="ride-section">
          <i className="ri-map-pin-2-fill icon"></i>
          <div>
            <h3 className="ride-title">Destination:</h3>
            <p className="ride-subtitle">{destination}</p>
          </div>
        </div>

        <div className="ride-section">
          <i className="ri-currency-line icon"></i>
          <div>
            <h3 className="ride-title">Amount: ₹{fare}</h3>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WaitingForDriver;
