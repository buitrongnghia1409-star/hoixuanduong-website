import { defineConfig } from "tinacms";

const branch =
  process.env.GITHUB_BRANCH ||
  process.env.VERCEL_GIT_COMMIT_REF ||
  process.env.HEAD ||
  "main";

export default defineConfig({
  branch,
  clientId: process.env.NEXT_PUBLIC_TINA_CLIENT_ID,
  token: process.env.TINA_TOKEN,
  build: {
    outputDir: "admin",
    publicDir: "public",
  },
  media: {
    tina: {
      mediaRoot: "assets/images",
      targetDir: "assets/images",
    },
  },
  schema: {
    collections: [
      {
        label: "Thông tin phòng khám",
        name: "clinic",
        path: "website/_data",
        format: "yml",
        ui: {
          previewSrc: "/index.html",
        },
        fields: [
          {
            type: "object",
            list: false,
            name: "clinic_data",
            label: "Clinic Data",
            ui: {
              itemProps: (item) => ({
                label: item?.clinic_name,
              }),
            },
            fields: [
              {
                type: "string",
                ui: {
                  component: "text",
                },
                name: "clinic_name",
                label: "Tên phòng khám",
              },
              {
                type: "rich-text",
                name: "introduction",
                label: "Giới thiệu",
              },
              {
                type: "string",
                name: "phone",
                label: "Số điện thoại",
              },
              {
                type: "string",
                name: "email",
                label: "Email",
              },
              {
                type: "string",
                name: "address",
                label: "Địa chỉ",
                ui: {
                  component: "textarea",
                },
              },
              {
                type: "string",
                name: "business_hours",
                label: "Giờ làm việc",
              },
              {
                type: "object",
                list: true,
                name: "branches",
                label: "Chi nhánh",
                ui: {
                  itemProps: (item) => ({
                    label: item?.branch_name,
                  }),
                },
                fields: [
                  {
                    type: "string",
                    name: "branch_name",
                    label: "Tên chi nhánh",
                  },
                  {
                    type: "string",
                    name: "branch_address",
                    label: "Địa chỉ chi nhánh",
                  },
                  {
                    type: "string",
                    name: "branch_phone",
                    label: "Số điện thoại chi nhánh",
                  },
                ],
              },
              {
                type: "object",
                list: true,
                name: "services",
                label: "Dịch vụ",
                ui: {
                  itemProps: (item) => ({
                    label: item?.service_name,
                  }),
                },
                fields: [
                  {
                    type: "string",
                    name: "service_name",
                    label: "Tên dịch vụ",
                  },
                  {
                    type: "string",
                    name: "service_description",
                    label: "Mô tả dịch vụ",
                    ui: {
                      component: "textarea",
                    },
                  },
                  {
                    type: "image",
                    name: "service_image",
                    label: "Hình ảnh dịch vụ",
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
});
