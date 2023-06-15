const mapQuery = (query: object) =>
	Object.fromEntries(
		Object.entries(query).map(([key, value]) => {
			let newValue = value;

			if (key === "where") {
				try {
					newValue = JSON.parse(newValue);
				} catch (error) {
					throw "Malformed JSON in the WHERE clause.";
				}
			} else if (newValue.includes(",")) {
				if (key === "distinct") {
					newValue = newValue.split(",");
				} else {
					newValue = Object.fromEntries(
						newValue.split(",").map((subPair: string) => subPair.split("-"))
					);
				}
			} else if (newValue.includes("-")) {
				const [subKey, subValue] = newValue.split("-");
				newValue = { [subKey]: subValue };
			}

			return [key, isNaN(newValue) ? newValue : Number(newValue)];
		})
	);

export { mapQuery };
