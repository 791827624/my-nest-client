import { Injectable, Logger } from '@nestjs/common';
import { JdyPayloadDto } from './dto/jdy-payload.dto';
import { HttpClientService } from '../../http/http-client.service';
@Injectable()
export class DataProcessingService {
  private readonly logger = new Logger(DataProcessingService.name);
  constructor(private readonly httpClient: HttpClientService) {}

  // API接口地址
  private readonly API_ENDPOINTS = {
    IMPORT_CUSTOMER: '/apiServer/api/v3/import-customer', // 个人导入客户
    CUSTOMER_TRANSFER: '/apiServer/api/v3/customer-transfer', // 转移客户
    CUSTOMER_SEARCH: '/apiServer/api/v3/customer/search', // 高级筛选接口（查询客户，查询员工）
    GET_USER: '/apiServer/api/v3/get-users', // 查询员工
  };

  async processData(payload: JdyPayloadDto) {
    try {
      const result = await this.tmType(payload.data); // 处理简道云推送的数据
      this.logger.log(`Processing completed for op: ${payload.op}`);
      return result;
    } catch (error) {
      this.logger.error(`Processing failed: ${error.message}`, error.stack);
      throw error;
    }
  }
  private checkModbile(mobile) {
    if (!mobile) return false;
    const re = /^1[3,4,5,6,7,8,9][0-9]{9}$/;
    const result = re.test(mobile);
    if (!result) {
      console.log('手机号码格式不正确！');
      return false; //若手机号码格式不正确则返回false
    }
    return true;
  }
  private async tmType(dataSource: any) {
    // 优越云页面id
    const entryType = {
      '6264bab5908f30000707e91f': '公海库',
      '60d93068771f550007ca2325': '顾问轮转',
      '60fe1bbeebd4570008be450a': '新资源主管分配',
      '61cd0c9bf1d8e2000825a1ca': '新资源客服分配',
      '66bd9966dae7590e5765543c': '新资源客服特批',
    };

    const {
      ch_phone1,
      ch_phone2,
      ch_phone3,
      new_sale,
      old_sale,
      student_id,
      student_name,
      entryId,
    } = dataSource;
    console.log(
      'dataSource---',
      new_sale,
      old_sale,
      student_id,
      student_name,
      entryType[entryId],
    );

    if (
      (entryId === '6264bab5908f30000707e91f' ||
        entryId === '60d93068771f550007ca2325') &&
      student_id &&
      old_sale?.name &&
      new_sale?.name
    ) {
      // 公海库、顾问轮转
      const phone1 = this.checkModbile(ch_phone1) && ch_phone1;
      const phone2 = this.checkModbile(ch_phone2) && ch_phone2;
      const phone3 = this.checkModbile(ch_phone3) && ch_phone3;
      const phone = phone1 || phone2 || phone3;
      console.log('ch_phone---', phone);
      const new_salesId = await this.searchUsers(new_sale.name);

      // 查询客户
      if (phone) {
        // 有手机号就走探马个人导入客户接口
        const requestBody = {
          qwUserId: new_salesId,
          fields: [
            {
              alias: 'customer_ch_phone',
              values: [phone],
            },
            {
              alias: 'name',
              values: [student_name + '-' + student_id],
            },
          ],
        };
        const resImport = await this.importCustomerData(requestBody);

        console.log('公海&轮转----个人导入', resImport);
      } else {
        // 没手机号，就走在职转移
        const customerInfo = await this.searchCustomer(student_id);
        console.log('customerInfo------', customerInfo);

        if (!customerInfo) return; // 没有客户或者顾问数据就返回
        if (old_sale.status != -1) {
          // 判断顾问是否离职
          const requestBody = {
            pageNo: 1,
            pageSize: 20,
            deleted: 0,
            handoverToUserid: new_salesId,
            customers: [
              {
                qwUserId: customerInfo.qwSalesId,
                customerId: customerInfo.customerId,
              },
            ],
          };
          const resTransfer = await this.transferCustomer(requestBody);

          console.log('resTransfer------', resTransfer);
        } else {
          console.log('顾问离职');
        }
      }
    } else if (
      (entryId === '60fe1bbeebd4570008be450a' ||
        entryId === '61cd0c9bf1d8e2000825a1ca' ||
        entryId === '66bd9966dae7590e5765543c') &&
      student_id &&
      new_sale?.name
    ) {
      // 新资源 分配只需要关心有没有手机号
      const phone1 = this.checkModbile(ch_phone1) && ch_phone1;
      const phone2 = this.checkModbile(ch_phone2) && ch_phone2;
      const phone3 = this.checkModbile(ch_phone3) && ch_phone3;
      const phone = phone1 || phone2 || phone3;
      const new_salesId = await this.searchUsers(new_sale.name);

      if (phone) {
        // 有手机号就走探马个人导入客户接口
        const requestBody = {
          qwUserId: new_salesId,
          fields: [
            {
              alias: 'customer_ch_phone',
              values: [phone],
            },
            {
              alias: 'name',
              values: [student_name + '-' + student_id],
            },
          ],
        };
        const resImport = await this.importCustomerData(requestBody);

        console.log('新资源----个人导入成功', resImport);
      }
    }
  }

  /**
   * 查询员工
   */
  async searchUsers(name): Promise<any> {
    const res = await this.httpClient.sendSignedRequest(
      this.API_ENDPOINTS.GET_USER,
      {
        pageNo: 1,
        pageSize: 20,
        deleted: 0,
        name,
      },
    );
    const saleInfo = res.data.result ?? [];
    const new_salesId = saleInfo.length && saleInfo[0]?.salesId;
    return new_salesId;
  }

  /**
   * 查询客户
   */
  async searchCustomer(student_id): Promise<any> {
    const res = await this.httpClient.sendSignedRequest(
      this.API_ENDPOINTS.CUSTOMER_SEARCH,
      {
        searchKey: student_id,
      },
    );
    // 提取顾问数据
    const infoList = res?.data?.data?.length ? res.data.data : [];

    let obj = null;
    if (infoList.length) {
      infoList.map((item) => {
        JSON.parse(item.salesDeptNames).map((v) => {
          if (v.includes('顾问')) obj = item;
        });
      });
      const customerInfo = obj;
      return customerInfo;
    } else {
      return null;
    }
  }

  /**
   * 个人导入客户数据
   */
  async importCustomerData(requestBody): Promise<any> {
    return this.httpClient.sendSignedRequest(
      this.API_ENDPOINTS.IMPORT_CUSTOMER,
      requestBody,
    );
  }

  /**
   * 个人导入客户数据
   */
  async transferCustomer(requestBody): Promise<any> {
    return this.httpClient.sendSignedRequest(
      this.API_ENDPOINTS.CUSTOMER_TRANSFER,
      requestBody,
    );
  }
}
