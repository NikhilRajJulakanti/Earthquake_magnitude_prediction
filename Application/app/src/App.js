"use client"

import { useEffect, useState } from "react"
import { Line } from "react-chartjs-2"
import Chart from "chart.js/auto"
import { CategoryScale } from "chart.js"

Chart.register(CategoryScale)

function App() {
  const [actualData, setActualData] = useState([])
  const [predictedData, setPredictedData] = useState([])
  const [labels, setLabels] = useState([])
  const [latestActual, setLatestActual] = useState(null)
  const [latestPredicted, setLatestPredicted] = useState(null)
  const [latestMAE, setLatestMAE] = useState(null)
  const [latestRMSE, setLatestRMSE] = useState(null)
  const [showComparison, setShowComparison] = useState(false)
  const [showEWS, setShowEWS] = useState(false)
  
  // EWS data states
  const [channel1Data, setChannel1Data] = useState([])
  const [channel2Data, setChannel2Data] = useState([])
  const [channel3Data, setChannel3Data] = useState([])
  // const [ewsLabels, setEwsLabels] = useState([]) // Removed as it is not used
  const [ewsPredicted, setEwsPredicted] = useState(null)
  const [predictedHistory, setPredictedHistory] = useState([])
  const [lastMax, setLastMax] = useState(null)
  const [lastMaxTimeStamp, setLastMaxTimeStamp] = useState(null)

  useEffect(() => {
    // Original WebSocket for Actual vs Predicted
    const wsAvp = new WebSocket("ws://localhost:8000/ws_avp")

    wsAvp.onmessage = (event) => {
      const data = JSON.parse(event.data)
      setLabels((prev) => [...prev.slice(-49), data.index])
      setActualData((prev) => [...prev.slice(-49), data.actual])
      setPredictedData((prev) => [...prev.slice(-49), data.predicted])
      setLatestActual(data.actual)
      setLatestPredicted(data.predicted)
      setLatestMAE(data.mae)
      setLatestRMSE(data.rmse)
    }

    // New WebSocket for Early Warning System
    const wsEws = new WebSocket("ws://localhost:8000/ws_ews")

    wsEws.onmessage = (event) => {
      const data = JSON.parse(event.data)
      // setEwsLabels((prev) => [...prev.slice(-999), data.index]) // Removed as it is not used
      setChannel1Data((prev) => [...prev.slice(-999), ...data.channel_1])
      setChannel2Data((prev) => [...prev.slice(-999), ...data.channel_2])
      setChannel3Data((prev) => [...prev.slice(-999), ...data.channel_3])
      setEwsPredicted(data.predicted)
      if (data.predicted > 4.5) {
        // make tripe beep sound
        var audio = new Audio('/beep7.mp3');
        audio.play();
      }
      setPredictedHistory((prev) => {
        const newHistory = [...prev, data.predicted]
        return newHistory.slice(-30) // Keep only the last 30 points
      })
      setLastMax((prevMax) => {
        const numericPrevMax = typeof prevMax === 'number' ? prevMax : parseFloat(prevMax) || 0;
        const newMax = Math.max(data.predicted, numericPrevMax);
        if (newMax > numericPrevMax) {
          setLastMaxTimeStamp(new Date().toLocaleString());
          return newMax;
        }
        return prevMax;
      });
    }

    return () => {
      wsAvp.close()
      wsEws.close()
    }
  }, [])

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    elements: { line: { tension: 0 } },
    animation: { duration: 0 },
    scales: {
      x: {
        type: "linear",
        min: labels[0],
        max: labels[labels.length - 1],
        grid: {
          color: "rgba(255, 255, 255, 0.1)",
        },
        ticks: {
          color: "#fff",
        },
      },
      y: {
        beginAtZero: false,
        grid: {
          color: "rgba(255, 255, 255, 0.1)",
        },
        ticks: {
          color: "#fff",
        },
      },
    },
    plugins: {
      legend: {
        position: "top",
        align: "center",
        labels: {
          color: "#fff",
          padding: 20,
        },
      },
      title: {
        display: true,
        text: "Real-Time Earthquake Magnitude",
        color: "#fff",
        padding: {
          top: 10,
          bottom: 10,
        },
        font: {
          size: 16,
          weight: "bold",
        },
      },
    },
  }

  const seismicChartOptions = {
    ...chartOptions,
    scales: {
      ...chartOptions.scales,
      x: {
        ...chartOptions.scales.x,
        min: 0,
        max: 1000,
      },
    },
    plugins: {
      ...chartOptions.plugins,
      legend: {
        ...chartOptions.plugins.legend,
        display: false,
      },
    },
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        backgroundColor: "#121212",
        padding: "1.5rem",
      }}
    >
      <div
        style={{
          maxWidth: "1400px",
          margin: "0 auto",
        }}
      >
        {/* Heading Added */}
        <h1
          style={{
            color: "#fff",
            textAlign: "center",
            fontSize: "2rem",
            marginBottom: "0.5rem",
            fontWeight: "bold",
          }}
        >
          {showEWS ? "Earthquake Early Warning System" : "Real-time Earthquake Magnitude Prediction"}
        </h1>
        {showEWS ? (
        <div
          style={{
            marginBottom: "1rem",
            textAlign: "center",
            color: "#fff",
            fontSize: "1.25rem",
          }}
        >
          <p>Last Max Magnitude: {lastMax} | Timestamp: {lastMaxTimeStamp}</p>
        </div>) : (<div
          style={{
            marginBottom: "1rem",
            textAlign: "center",
            color: "#fff",
            fontSize: "1.25rem",
          }}
        >CNN-GRU model performance on Earthquake Magnitude Prediction</div>)}

        <div style={{ display: "flex", justifyContent: "center", marginBottom: "1.5rem" }}>
          <div style={{ display: "flex", gap: "1rem" }}>
            <button
              onClick={() => setShowEWS(false)}
              style={{
                padding: "0.75rem 1.5rem",
                backgroundColor: !showEWS ? "#0066ff" : "#333",
                color: "white",
                border: "none",
                borderRadius: "0.5rem",
                cursor: "pointer",
                transition: "background-color 0.2s",
              }}
              onMouseOver={(e) => (e.target.style.backgroundColor = !showEWS ? "#0052cc" : "#444")}
              onMouseOut={(e) => (e.target.style.backgroundColor = !showEWS ? "#0066ff" : "#333")}
            >
              Actual vs Predicted
            </button>

            {!showEWS && (
              <button
                onClick={() => setShowComparison(!showComparison)}
                style={{
                  padding: "0.75rem 1.5rem",
                  backgroundColor: showComparison ? "#0066ff" : "#333",
                  color: "white",
                  border: "none",
                  borderRadius: "0.5rem",
                  cursor: "pointer",
                  transition: "background-color 0.2s",
                }}
                onMouseOver={(e) => (e.target.style.backgroundColor = showComparison ? "#0052cc" : "#444")}
                onMouseOut={(e) => (e.target.style.backgroundColor = showComparison ? "#0066ff" : "#333")}
              >
                {showComparison ? "Separate" : "Compare"}
              </button>
            )}
          </div>

          <div style={{ width: "1px", backgroundColor: "#444", margin: "0 1.5rem" }}></div>

          <button
            onClick={() => setShowEWS(true)}
            style={{
              padding: "0.75rem 1.5rem",
              backgroundColor: showEWS ? "#0066ff" : "#333",
              color: "white",
              border: "none",
              borderRadius: "0.5rem",
              cursor: "pointer",
              transition: "background-color 0.2s",
            }}
            onMouseOver={(e) => (e.target.style.backgroundColor = showEWS ? "#0052cc" : "#444")}
            onMouseOut={(e) => (e.target.style.backgroundColor = showEWS ? "#0066ff" : "#333")}
          >
            Early Warning System
          </button>
        </div>

        {!showEWS ? (
          showComparison ? (
            <div
              style={{
                position: "relative",
                height: "500px",
                width: "100%",
                backgroundColor: "#1E1E1E",
                borderRadius: "0.5rem",
                padding: "1.5rem",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  right: "1.5rem",
                  top: "1.5rem",
                  display: "flex",
                  flexDirection: "column", // Change to column to stack items
                  alignItems: "flex-start", // Align items to the left
                  gap: "0.5rem", // Reduce gap for better spacing
                  fontSize: "0.875rem",
                  fontWeight: "bold",
                }}
              >
                <div style={{ display: "flex", gap: "1rem" }}>
                  <span style={{ color: "#0000FF" }}>
                    Actual: {latestActual !== null ? latestActual : "N/A"}
                  </span>
                  <span style={{ color: "#00FF00" }}>
                    Predicted: {latestPredicted !== null ? latestPredicted.toFixed(2) : "N/A"}
                  </span>
                </div>

                {/* New span for MAE and RMSE */}
                <div style={{ display: "flex", gap: "1rem" }}>
                  <span style={{ color: "#FFFFFF" }}>
                    MAE: {latestMAE !== null ? latestMAE : "N/A"}
                  </span>
                  <span style={{ color: "#FF0000" }}>
                    RMSE: {latestRMSE !== null ? latestRMSE : "N/A"}
                  </span>
                </div>
              </div>

              <Line
                data={{
                  labels,
                  datasets: [
                    {
                      label: "Actual Magnitude",
                      data: actualData,
                      borderColor: "#0000FF",
                      backgroundColor: "rgba(0, 0, 255, 0.2)",
                      borderWidth: 2,
                    },
                    {
                      label: "Predicted Magnitude",
                      data: predictedData,
                      borderColor: "#00FF00",
                      backgroundColor: "rgba(0, 255, 0, 0.2)",
                      borderWidth: 2,
                    },
                  ],
                }}
                options={chartOptions}
              />
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(600px, 1fr))",
                gap: "1.5rem",
              }}
            >
              {[
                ["Actual", actualData, "#0000FF", latestActual],
                ["Predicted", predictedData, "#00FF00", latestPredicted],
              ].map(([title, data, color, latest]) => (
                <div
                  key={title}
                  style={{
                    position: "relative",
                    height: "500px",
                    backgroundColor: "#1E1E1E",
                    borderRadius: "0.5rem",
                    padding: "1.5rem",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      right: "1.5rem",
                      top: "1.5rem",
                      fontSize: "0.875rem",
                      fontWeight: "bold",
                      color: color,
                    }}
                  >
                    Mag: {latest !== null ? latest.toFixed(2) : "N/A"}
                  </div>
                  <Line
                    data={{
                      labels,
                      datasets: [
                        {
                          label: `${title} Magnitude`,
                          data: data,
                          borderColor: color,
                          backgroundColor: `${color}33`,
                          borderWidth: 2,
                        },
                      ],
                    }}
                    options={{
                      ...chartOptions,
                      plugins: {
                        ...chartOptions.plugins,
                        title: {
                          ...chartOptions.plugins.title,
                          text: `${title} Magnitude`,
                        },
                      },
                    }}
                  />
                </div>
              ))}
            </div>
          )
        ) : (
          // Early Warning System UI
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(600px, 1fr))",
              gap: "1.5rem",
            }}
          >
            {/* Left side - 3 seismic data graphs stacked */}
            <div
              style={{
                backgroundColor: "#1E1E1E",
                borderRadius: "0.5rem",
                padding: "1.5rem",
                display: "flex",
                flexDirection: "column",
                gap: "0.5rem",
                height: "500px",
              }}
            >
              <div style={{ flex: 1, position: "relative" }}>
                <Line
                  data={{
                    labels: Array.from({ length: 1000 }, (_, i) => i),
                    datasets: [
                      {
                        data: channel1Data.slice(-1000),
                        borderColor: "#FF0000",
                        backgroundColor: "rgba(255, 0, 0, 0.1)",
                        borderWidth: 1,
                        pointRadius: 0,
                      },
                    ],
                  }}
                  options={{
                    ...seismicChartOptions,
                    plugins: {
                      ...seismicChartOptions.plugins,
                      title: {
                        display: true,
                        text: "Channel 1",
                        color: "#FF0000",
                        font: {
                          size: 14,
                          weight: "bold",
                        },
                      },
                    },
                  }}
                />
              </div>

              <div style={{ flex: 1, position: "relative" }}>
                <Line
                  data={{
                    labels: Array.from({ length: 1000 }, (_, i) => i),
                    datasets: [
                      {
                        data: channel2Data.slice(-1000),
                        borderColor: "#00FF00",
                        backgroundColor: "rgba(0, 255, 0, 0.1)",
                        borderWidth: 1,
                        pointRadius: 0,
                      },
                    ],
                  }}
                  options={{
                    ...seismicChartOptions,
                    plugins: {
                      ...seismicChartOptions.plugins,
                      title: {
                        display: true,
                        text: "Channel 2",
                        color: "#00FF00",
                        font: {
                          size: 14,
                          weight: "bold",
                        },
                      },
                    },
                  }}
                />
              </div>

              <div style={{ flex: 1, position: "relative" }}>
                <Line
                  data={{
                    labels: Array.from({ length: 1000 }, (_, i) => i),
                    datasets: [
                      {
                        data: channel3Data.slice(-1000),
                        borderColor: "#0000FF",
                        backgroundColor: "rgba(0, 0, 255, 0.1)",
                        borderWidth: 1,
                        pointRadius: 0,
                      },
                    ],
                  }}
                  options={{
                    ...seismicChartOptions,
                    plugins: {
                      ...seismicChartOptions.plugins,
                      title: {
                        display: true,
                        text: "Channel 3",
                        color: "#0000FF",
                        font: {
                          size: 14,
                          weight: "bold",
                        },
                      },
                    },
                  }}
                />
              </div>
            </div>

            {/* Right side - Predicted magnitude graph */}
            <div
              style={{
                position: "relative",
                height: "500px",
                backgroundColor: "#1E1E1E",
                borderRadius: "0.5rem",
                padding: "1.5rem",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  right: "1.5rem",
                  top: "1.5rem",
                  fontSize: "0.875rem",
                  fontWeight: "bold",
                  color: getMagnitudeColor(ewsPredicted),
                }}
              >
                Magnitude Value: {ewsPredicted !== null ? ewsPredicted.toFixed(2) : "N/A"}
              </div>
              <Line
                data={{
                  labels: Array.from({ length: 30 }, (_, i) => i + 1),
                  datasets: [
                    {
                      label: "Predicted Magnitude",
                      data: predictedHistory,
                      borderColor: getMagnitudeColor(ewsPredicted),
                      backgroundColor: `${getMagnitudeColor(ewsPredicted)}33`,
                      borderWidth: 2,
                      fill: true,
                    },
                  ],
                }}
                options={{
                  ...chartOptions,
                  scales: {
                    ...chartOptions.scales,
                    x: {
                      ...chartOptions.scales.x,
                      min: 1,
                      max: 30,
                      grid: {
                        color: "rgba(255, 255, 255, 0.1)",
                      },
                      ticks: {
                        color: "#fff",
                        maxTicksLimit: 10,
                      },
                    },
                    y: {
                      ...chartOptions.scales.y,
                      min: 2,
                      max: predictedHistory.length ? Math.max(...predictedHistory) + 1 : 10,
                      ticks: {
                        color: "#fff",
                        callback: (value) => value.toFixed(1),
                      },
                    },
                  },
                  plugins: {
                    ...chartOptions.plugins,
                    title: {
                      ...chartOptions.plugins.title,
                      text: "Predicted Magnitude",
                    },
                  },
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Helper function to get color based on magnitude
function getMagnitudeColor(magnitude) {
  if (magnitude === null) return "#888"
  if (magnitude < 2) return "#00FF00" // Green for minor
  if (magnitude < 4) return "#FFFF00" // Yellow for light
  if (magnitude < 6) return "#FFA500" // Orange for moderate
  if (magnitude < 7) return "#FF0000" // Red for strong
  return "#8B0000" // Dark red for major/great
}


export default App