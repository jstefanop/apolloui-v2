const config = {
	mainWebsite: "https://www.futurebit.io",
	footerLinks: [
		{
			anchor: "Support",
			url: "https://www.futurebit.io/contact",
			target: "_blank",
		},
		{
			anchor: "Shop",
			url: "https://shop.futurebit.io",
			target: "_blank",
		},
		{
			anchor: "Website",
			url: "https://www.futurebit.io",
			target: "_blank",
		},
	],
	thresholds: {
		MINER_STOP_PENDING_THRESHOLD: 10, // Seconds to wait for stopping
		MINER_START_PENDING_THRESHOLD: 50, // Seconds to wait for starting
		MINER_SUCCESS_ALERT_DURATION: 5000, // Milliseconds to display success alert
		MINER_SUCCESS_THRESHOLD: 60, // Seconds to show success alert
		NODE_STOP_PENDING_THRESHOLD: 10, // Seconds to wait for stopping
		NODE_START_PENDING_THRESHOLD: 35, // Seconds to wait for starting
		NODE_SUCCESS_ALERT_DURATION: 5000, // Milliseconds to display success alert
		NODE_SUCCESS_THRESHOLD: 60, // Seconds to show success alert
	},
};

export default config;