export const getMetaDataStub = () => {
	return [
		{
			slug: "student",
			fields: {
				name: {
					type: "String",
				},
				relation_classroom: {
					type: "relation",
					many: true,
					ref: "classroom.id",
				},
			},
		},
		{
			slug: "classroom",
			fields: {
				name: {
					type: "String",
					required: true,
				},
				relation_student: {
					type: "relation",
					many: true,
					ref: "student.id",
				},
			},
		},
		{
			slug: "song",
			fields: {
				title: {
					type: "String",
					required: true,
				},
				relation_album: {
					type: "relation",
					ref: "album.relation_song",
					many: false,
				},
			},
		},
		{
			slug: "record",
			fields: {
				relation_song: {
					type: "relation",
					ref: "song.relation_album",
					many: true,
				},
				year: {
					type: "number",
					subtype: "Int",
					required: true,
				},
				title: {
					type: "String",
					required: true,
					unique: true,
					index: true,
				},
				dateCreated: {
					type: "DateTime",
					defaultValue: {
						kind: "now",
					},
				},
				mJson: {
					type: "Json",
					defaultValue: '{"hello":"world"}',
				},
			},
		},
	];
};
