import React, { useEffect } from 'react';
import { closePaymentModal, useFlutterwave } from 'flutterwave-react-v3';
import { Input, Space, Typography , Form, Row, Button as AntButton, Result, Col, Image, notification, Button} from 'antd';
import { checkTransactionStatusInhouse, getCustomerPaymentDetails, postCustomerCollection } from './utils/ApiUtils';
import { DOMAIN_MAIL, EasyOwnONStatus, FLW_PUBLIC_KEY, paymentRedirectUrl, paymentdescription, paymentslogo, paymenttitle } from './constants';


import numeral from 'numeral';

import { Riple } from 'react-loading-indicators';

import { CloseCircleOutlined } from '@ant-design/icons';
import moment from 'moment';
const Easy_LOGO = require('./easylogo.png');


const { Paragraph, Text } = Typography;

const queryParameters = new URLSearchParams(window.location.search)
export default function App() {
  const [form] = Form.useForm();
  
  //const { getFieldDecorator } = form.getFieldError();


  
    const [customerDetails, setcustomerDetails] = React.useState({
      payg: "",
    serialnumber: "",
    customeraccount: "",
    amount: 0,
    customername: "",
    phonenumber: "",
    loanamount:"",
    amountpaid:""
  });
    
    const [payingNumber, setPayingNumber] = React.useState("");
    
    const [amountToPay, setAmountToPay] = React.useState("0");
  
    const [seeDetails, setSeeDetails] = React.useState(false);
    const [payg, setPayg] =  React.useState("");
    const [phoneringing, setPhoneRinging]= React.useState(false);

    const styles= {
      container: {
        //flex: 1,
        backgroundColor: '#F2F4F4',
        alignItems: 'center',
        justifyContent: 'center',
       height:'100%',
       width:'100%',
       
      },
      textInput:{
        backgroundColor: "white", marginBottom: 9, marginTop: 1, width:'70%', height:40
      },
      welcome: { margin: 12, fontSize: 20, fontWeight: "500", alignSelf: "center", color:"black" },
      submitApplicationButton:{
        backgroundColor:"#388E3C",
        width: '100%',
        padding: 8.5,
        borderRadius: 5,
        alignSelf:'center',
        alignItems: 'center',
        marginVertical:12,
        height:50
      },
      paymentButton:{
        backgroundColor:'yellow',
        height: 50
      },
      inputWrapper:{
        //width:'80%', 
        alignItems:'center', 
        marginTop: '1%',
        backgroundColor:'white',
        padding: '2%',
        //width:'60%'
        marginBottom:'1%',
        borderRadius:8
      },
      antdInput:{
        borderRadius:4, borderWidth:2, marginTop:-4, color:'black'
      }
    }
   
  const config = {
    public_key: FLW_PUBLIC_KEY,
    tx_ref: payg+Date.now().toString(),
    amount: amountToPay,
    currency: 'UGX',
    //payment_options: 'mobilemoneyuganda',
    customer: {
      email:customerDetails.customeraccount!=="" && customerDetails.customeraccount+DOMAIN_MAIL,
      phone_number: payingNumber,
      name: customerDetails.customername,
    },
    customizations: {
      title: paymenttitle,
      logo: paymentslogo,
      description: paymentdescription,
    },
    redirect_url:paymentRedirectUrl,
    meta:{
      payg: payg
    }
  };

  //let status=, tx_ref, tr_id = undefined;
   let tx_ref = queryParameters.get("tx_ref")
   let tr_id=queryParameters.get("transaction_id")
   let status=queryParameters.get("status")
 

  const handleFlutterPayment = useFlutterwave(config);
const [isLoading, setIsLoading]=React.useState(false)

function hasValidPrefix(phoneNumber) {
  return phoneNumber.startsWith('020') || 
         phoneNumber.startsWith('070') || 
         phoneNumber.startsWith('075') || 
         phoneNumber.startsWith('074');
}
function timeBetweenNowAnd8AM() {
  const now = moment(); // Get the current time
  const startTime = moment('2024-08-23 21:14:00'); // Start time
  const endTime = moment('2024-08-25 10:14:00'); // End time
  // Return true if the current time is between startTime and endTime
  return now.isBetween(startTime, endTime);
}
function isNotTeamMemeber (phonenumber) {
  return phonenumber !=="0705152137" && phonenumber !=="0784488869"
  && phonenumber !=="0751807632"&& phonenumber !=="0765003886"
}
///var/www/html/PAY-UI
const tr_ids = payg + Date.now().toString()
  const processPayment3 =(event)=>{
    event.preventDefault();
    handleFlutterPayment({
      callback: (response) => {
        setIsLoading(false)
         console.log(response);
          closePaymentModal() // this will close the modal programmatically
      },
      onClose: () => {setIsLoading(false)},
    });
    if(hasValidPrefix(payingNumber)){
    if(parseInt(amountToPay)<=parseInt(customerDetails.loanamount)-parseInt(customerDetails.amountpaid)){
    
    const toPayLoad = {
      reference: payg,
      subscriber: {
        msisdn: payingNumber.substring(1, 10)
      },
      transaction: {
        amount: amountToPay,
        id: tr_ids
      }
    }
    setSeeDetails(false)
    setPhoneRinging(true)
    postCustomerCollection(toPayLoad)
    .then(response=>{
      //alert(JSON.stringify(response))
      setSeeDetails(false)
      setPhoneRinging(true)
      if(response.code===200){

    
      const intervalId = setInterval(async () => {
        try {
      const toPayLoad2={
        transactionId: tr_ids
      }
          checkTransactionStatusInhouse(toPayLoad2)
          .then(response=>{
            if(response.status==="completed"){
              window.location.replace('/?status=success&tx_ref='+payg+'&transaction_id='+tr_ids)
              tx_ref = queryParameters.get("tx_ref")
              tr_id=queryParameters.get("transaction_id")
              if(queryParameters.get("status") ==="success"){
                clearInterval(intervalId);
                setPhoneRinging(false)
              }
            }
          }).catch(error=>{
            console.log(error)
            window.location.replace('/?status=error&tx_ref='+payg)
              tx_ref = queryParameters.get("tx_ref")
              tr_id=queryParameters.get("transaction_id")
              if(queryParameters.get("status") ==="error"){
                clearInterval(intervalId);
                setPhoneRinging(false)
              }
          })
          
        } catch (error) {
         
          console.error('Error checking record status:', error);
          clearInterval(intervalId); // Optionally stop the watch on error
        }
      }, 5000);
    }
    }).catch(error=>{
alert(error.message)
    })
  }else{
    notification.error({message: 'Error', description:`You cannot Pay More than the balance`})
  }
}else{
  notification.error({message: 'Error', description:`Only Airtel numbers can pay at the moment`})
}
   // alert(JSON.stringify(toPayLoad)) 
  }

  const processPayment = (event) => {
    event.preventDefault();
    if(isNotTeamMemeber(payingNumber) && timeBetweenNowAnd8AM()){
      handleFlutterPayment({
        callback: (response) => {
          setIsLoading(false)
           console.log(response);
            closePaymentModal() // this will close the modal programmatically
        },
        onClose: () => {setIsLoading(false)},
      });
    }else{
    if (hasValidPrefix(payingNumber)) {
      if (parseInt(amountToPay) <= parseInt(customerDetails.loanamount) - parseInt(customerDetails.amountpaid)) {
        const toPayLoad = {
          reference: payg,
          subscriber: {
            msisdn: payingNumber.substring(1, 10)
          },
          transaction: {
            amount: amountToPay,
            id: tr_ids
          }
        };
        setSeeDetails(false);
        setPhoneRinging(true);
        postCustomerCollection(toPayLoad)
          .then(response => {
            if (response.code === 200) {
              const checkTransaction = async () => {
                try {
                  const toPayLoad2 = {
                    transactionId: tr_ids
                  };
                  const response = await checkTransactionStatusInhouse(toPayLoad2);
                  if (response.status === "completed") {
                    window.location.replace('/?status=success&tx_ref=' + payg + '&transaction_id=' + tr_ids);
                    tx_ref = queryParameters.get("tx_ref");
                    tr_id = queryParameters.get("transaction_id");
                    if (queryParameters.get("status") === "success") {
                      setPhoneRinging(false);
                      return; // Exit recursion
                    }
                  } else {
                    setTimeout(checkTransaction, 5000); // Schedule next check
                  }
                } catch (error) {
                  console.error('Error checking record status:', error);
                  window.location.replace('/?status=error&tx_ref=' + payg);
                  tx_ref = queryParameters.get("tx_ref");
                  tr_id = queryParameters.get("transaction_id");
                  if (queryParameters.get("status") === "error") {
                    setPhoneRinging(false);
                  } else {
                    setTimeout(checkTransaction, 5000); // Schedule next check
                  }
                }
              };
              checkTransaction();
            }
          })
          .catch(error => {
            setPhoneRinging(false);
            notification.error({message: 'Error', description:error.message, duration:6000})
          });
      } else {
        notification.error({ message: 'Error', description: `You cannot pay more than the balance` });
      }
    } else {
      notification.error({ message: 'Error', description: `Only Airtel numbers can pay at the moment` });
    }
  }
  };

  const onFinish = () => {
    processPayment()
  };

  const onReset = () => {
    setSeeDetails(false)
    form.resetFields();
  };

  const onTextChange=(e)=>{
  if(seeDetails===true){
    setSeeDetails(false)
  }
    const input = e.target
//alert(input.value)
   
 setPayg(input.value)
   // alert(payg)
  }
  const getCustomerDetailsffff=async(data)=>{
   setIsLoading(true)
    const toPayLoad={
      payg: data!==undefined?data:payg
    }
    getCustomerPaymentDetails(toPayLoad)
    .then(response=>{
      alert(JSON.stringify(response))
      setIsLoading(false)
      if(response.length>0){
      let balance = response[0].loanamount - response[0].amountpaid
      let minpayment = response[0].amount
      setSeeDetails(true)
      setcustomerDetails(response[0])
      setPayingNumber(response[0].phonenumber)
      balance < minpayment?setAmountToPay(balance):setAmountToPay(minpayment)
      
      form.setFieldsValue({
        PayingNumber: response[0].phonenumber, 
        Amount:balance < minpayment?balance:minpayment,
        CustomerNumber: response[0].customeraccount,
        payg:response[0].payg,
      })
    }
    
    else{
      
      //setErrorMessage(true)
      setIsLoading(false)
      notification.error({message: 'Error', description:`Device Code ${data!==undefined?data:payg} was not found`})
    }
    }).catch(error=>{
      notification.error({message: 'Error', description:`Device Code ${data} was not found`})
      ///alert(JSON.stringify(error))
      setIsLoading(false)
      setSeeDetails(false)
       }
    )
  }

  const getCustomerDetails = async (data) => {
  setIsLoading(true);
  const code = data !== undefined ? data : payg;

  try {
    const toPayLoad = { payg: code };
    const response = await getCustomerPaymentDetails(toPayLoad);
    if (response.length > 0) {
      const customer = response[0];
      const balance = customer.loanamount - customer.amountpaid;
      const minpayment = customer.amount;
      const amount = balance < minpayment ? balance : minpayment;

      setSeeDetails(true);
      setcustomerDetails(customer);
      setPayingNumber(customer.phonenumber);
      setAmountToPay(amount);

      form.setFieldsValue({
        PayingNumber: customer.phonenumber,
        Amount: amount,
        CustomerNumber: customer.customeraccount,
        payg: customer.payg,
      });
    } else {
      notification.error({
        message: 'Error',
        description: `${response.messsage} `,
      });
      setSeeDetails(false);
    }
  } catch (error) {
    notification.error({
      message: 'Error',
      description: `${error.message}`,
    });
    setSeeDetails(false);
  } finally {
    setIsLoading(false);
  }
};


 
  // const status = queryParameters.get("status")
  // const tx_ref = queryParameters.get("tx_ref")
  // const tr_id=queryParameters.get("transaction_id")

  const clearUrlData=()=>{
    queryParameters.delete('status')
    queryParameters.delete('tx_ref')
    queryParameters.delete('transaction_id')
    //window.history.pushState(0, "", '/')
    window.location.replace('/')
  }
  const clearUrlData2=()=>{
    const immutable_payg = queryParameters.get('tx_ref')
    queryParameters.delete('status')
    queryParameters.delete('tx_ref')
    queryParameters.delete('transaction_id')
    //window.history.pushState(0, "", '/')
    window.location.replace('/?devicetag='+immutable_payg)
  }
 useEffect(() => {
  // if(queryParameters.get("status") !==null){
  //   alert(status)
  // }
  if (queryParameters.get("deviceTag") !== null || queryParameters.get("devicetag") !== null) {
    const deviceTag = queryParameters.get("deviceTag") || queryParameters.get("devicetag");
    setPayg(deviceTag)
    getCustomerDetails(deviceTag);
}
  }, 
  
  []
  ); 

  const goBackToDetails=()=>{
    setSeeDetails(true)
    setPhoneRinging(false)
  }
  return (
    <Row justify={'center'}>
                  <Row style={{backgroundColor:'white', paddingLeft:16, paddingRight:16, width:'90%', marginTop:12, borderRadius:9}}
                   justify={'center'}>
                {EasyOwnONStatus!==true ? <Text style={{fontSize:25, fontWeight:'500', color:"#263238", marginTop:8}}>{paymenttitle}</Text>  
        :<Image width={200} src={Easy_LOGO} />} 
                  {status !=null && status.toString().length>0 &&
          <Col span={24} >

            {status.toString().startsWith("success")?
            <Result
              status="success"
              title="Your Payment was Successful!"
              subTitle={<Text copyable style={{ fontSize: 16, fontWeight: '500' }}>
                Transaction Reference is: {tx_ref} and transaction Id is: {tr_id}</Text>}
              extra={[
                <AntButton htmlType="button" type="primary"
                  style={{}} onClick={() => clearUrlData()}>
                  Go back
                </AntButton>,
              ]}
            />:

<Result
    status="error"
    title="Payment Failed"
    //subTitle="Please check and modify the following information before resubmitting."
    // extra={[
    //   <Button type="primary" key="console">
    //     Go Console
    //   </Button>,
    //   <Button key="buy">Buy Again</Button>,
    // ]}
  >
    <div className="desc">
      <center>
      <Paragraph>
        <Text
          strong
          style={{
            fontSize: 16,
          }}
        >
          The payment might have failed due to the following errors:
        </Text>
      </Paragraph>
      <Paragraph>
        <CloseCircleOutlined className="site-result-demo-error-icon" /> You submitted incorrect details
        or you have insufficient balance. <a onClick={()=>clearUrlData2()}>Try Again &gt;</a>
      </Paragraph>
      {/* <Paragraph>
        <CloseCircleOutlined className="site-result-demo-error-icon" /> The USSD prompt to eneter pin did not come 
        <a onClick={()=>processPayment()}> Retry &gt;</a>
      </Paragraph> */}
      </center>
    </div>
  </Result>
}
          </Col>
 } 
                  
{/* Form */} 
                    <Row justify={'center'} style={{width:'100%'}}>
                      <Col span={24} >
            {seeDetails === true  ?
              <center>
                <Text strong>Hello, {customerDetails.customername}</Text>
                <br/>
                
                <Text strong>Your Phone is, {customerDetails.dealname} and your balance is 
               UGX {numeral(parseInt(customerDetails.loanamount)-parseInt(customerDetails.amountpaid)).format(',')}</Text>
              </center>
              : null}    
            <Form layout='vertical' form={form} name="control-hooks" onFinish={onFinish}
            
            //style={{ width:'100%'}}
            >
            {phoneringing && !seeDetails ?
           <center>
           
            <div style={{marginBottom:22}}>
              <p style={{fontSize: 25, fontWeight:'400'}}>Payment Authorisation </p>
           <Riple color="#32cd32" size="large" text="" textColor="" /><br></br>
           <Button onClick={()=>goBackToDetails()}>Go Back</Button>
           </div>
           </center>:null}
           {/* {!phoneringing && status ==null?
           <div>
           <Typography type="danger" style={{marginLeft: 6,fontWeight:'500', color:'red', fontSize:17}}>Pay with AIRTEL only</Typography>
           </div>:null} */}
              {!phoneringing&& status ==null ?  (
              //   EasyOwnONStatus ?
              //   (
              //     <center>
              //       <Space style={{paddingBottom:20, display:'block'}}>
              //       <Text strong>Dear Customer,</Text>
                   
              //       <Text strong copyable> Please Call 0705152137 for assistance</Text>
              //       </Space>
              //     </center>
              //   ):

              //   <Form.Item name="payg" label="PAYG NUMBER" rules={[{ required: true }]}>
              //   <Input style={styles.antdInput} value={payg} name='payg' 
              //    onInput={(e)=>onTextChange(e)}
              //   />
              // </Form.Item>
              
              <Form.Item name="payg" label="PAYG NUMBER" rules={[{ required: true }]}>
                <Input style={styles.antdInput} value={payg} name='payg' 
                 onInput={(e)=>onTextChange(e)}
                />
              </Form.Item>
              ):null
              }
              {seeDetails ===true && customerDetails.customeraccount!==""?
              <>
              <Form.Item name="CustomerNumber" label="Customer Number" rules={[{ required: false }]} >
                <Input size='large' style={styles.antdInput} 
                value={customerDetails.customeraccount!=="" && customerDetails.customeraccount} status={customerDetails.customeraccount!==""?'success':'error'} disabled />
              </Form.Item>
              <Form.Item name="PayingNumber" label="Paying Number" rules={[{ required: true }]}>
                <Input size='large' style={styles.antdInput} value={payingNumber.toString()} type='text'
                //onChange={(e) => setPayingNumber(e.target.value)}
                status={payingNumber!==""?'success':'error'}
                onChange={(e) => setPayingNumber(e.target.value)}
                />
              </Form.Item>
              <Form.Item name="Amount" label="Amount" rules={[{ required: true }]}>
                <Input size='large' style={styles.antdInput} onChange={(e) => setAmountToPay(e.target.value)} 
                value={amountToPay.toString()} 
                />
              </Form.Item>
              <center>
                <Form.Item >
                  <Space>
                    <AntButton type="primary" htmlType="submit"
                      loading={isLoading}
                      disabled={isLoading ? true : false}
                       onClick={(e) => processPayment(e)}
                      style={{ backgroundColor: isLoading ? '#AED6F1' : '#2471A3', color: 'white' }}
                    >
                      PAY NOW
                    </AntButton>
                    
                    <AntButton htmlType="button" onClick={onReset}>
                      Reset
                    </AntButton>
                  </Space>
                </Form.Item>
                
             
              </center>
              </>:null }
              {/* {!seeDetails &&  status ==null  && ! EasyOwnONStatus ? */}
              {!seeDetails && status == null && !phoneringing ?
                <center>
                  <Form.Item >
                    <Space>
                      <AntButton type="primary"
                        loading={isLoading}
                        disabled={isLoading ? true : false}
                        value={payg}
                        onClick={() => getCustomerDetails()}
                        style={{ backgroundColor: isLoading ? '#AED6F1' : '#2471A3', color: 'white' }}
                      >
                        REQUEST DETAILS
                      </AntButton>
                    </Space>
                  </Form.Item>
                </center> : null}
            </Form>
          </Col>
        </Row>
      </Row>
    </Row>
  );
}


// proxy_pass http://146.190.137.90:3001/;
// proxy_set_header Host $host;
// proxy_set_header X-Real-IP $remote_addr;
// proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
// proxy_set_header X-Forwarded-Proto $scheme;