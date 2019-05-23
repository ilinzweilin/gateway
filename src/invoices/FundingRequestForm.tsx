import React from 'react';
import { Link } from 'react-router-dom';
import { Box, Button, FormField, TextInput } from 'grommet';
import { LabelValuePair } from '../common/interfaces';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { FundingRequest } from '../common/models/funding-request';
import SearchSelect from '../components/form/SearchSelect';
import { dateFormatter } from '../common/formaters';
import { parseDate } from '../common/parsers';
import { isValidAddress } from 'ethereumjs-util';
type FundingRequestFormProps = {
  onSubmit: (fundingRequest: FundingRequest) => void;
  onDiscard: () => void;
  contacts: LabelValuePair[];
  fundingRequest: FundingRequest;
};

export default class FundingRequestForm extends React.Component<FundingRequestFormProps> {
  displayName = 'CreateEditInvoice';
  static defaultProps: FundingRequestFormProps = {
    onSubmit: (fundingRequest: FundingRequest) => {
      // do nothing by default
    },
    onDiscard: () => {
      // do nothing by default
    },
    fundingRequest: new FundingRequest(),
    contacts: [],
  };

  state = { submitted: false };

  onSubmit = (values: FundingRequest) => {
    return this.props.onSubmit({ ...values });
  };

  onDiscard = () => {
    this.props.onDiscard();
  };


  render() {

    const { submitted } = this.state;
    const { fundingRequest, contacts } = this.props;
    const columnGap = 'medium';
    const sectionGap = 'large';


    const fundingRequestValidation = Yup.object().shape({
      funder: Yup.string()
        .required('This field is required'),
      //TODO add eth address validation here
        wallet_address: Yup.string()
        .test('is-eth-address', 'Please enter a valid eth address',(value) => {
          return isValidAddress(value);
        })
        .required('This field is required'),
      amount: Yup.number()
        .required('This field is required'),
      apr: Yup.number()
        .required('This field is required'),
      fee: Yup.number()
        .required('This field is required'),
      repayment_due_date: Yup.date()
        .typeError('Wrong date format')
        .required('This field is required'),

    });

    return (
      <Box width={'large'} pad={{ top: 'large', bottom: 'large' }}>
        <Formik
          validationSchema={fundingRequestValidation}
          initialValues={fundingRequest}
          validateOnBlur={submitted}
          validateOnChange={submitted}
          onSubmit={(values, { setSubmitting }) => {
            if (!values) return;
            this.onSubmit(values);
            setSubmitting(true);
          }}
        >
          {
            ({
               values,
               errors,
               handleChange,
               setFieldValue,
               handleSubmit,
             }) => {

              // Calculate days and repayment_amount
              let days;
              let repaymentAmount;
              const today = new Date();
              const repaymentDate = new Date(values.repayment_due_date);
              const diff = repaymentDate.getTime() - today.getTime();
              days =  Math.ceil(diff / (1000 * 60 * 60 * 24));
              repaymentAmount = values.amount * (1 + (values.apr / 100) /  365 * days) + (values.amount * (values.fee / 100));

              if(isNaN(repaymentAmount)) repaymentAmount = 0;
              if(isNaN(days)) days = 0;

              values.days = days;
              values.repayment_amount = repaymentAmount.toFixed(2)

              return (
                <form
                  onSubmit={event => {
                    this.setState({ submitted: true });
                    handleSubmit(event);
                  }}
                >
                  <Box direction="column" gap={sectionGap}>

                    <Box gap={columnGap}>
                      <Box direction="row" gap={columnGap}>
                        <Box basis={'1/2'} gap={columnGap}>
                          <FormField
                            label="Funder's Name"
                            error={errors!.funder}
                          >
                            <SearchSelect
                              onChange={(item) => {
                                setFieldValue('funder', item.value);

                              }}
                              options={contacts}
                              selected={
                                contacts.find(
                                  contact =>
                                    contact.value === values!.funder,
                                )
                              }
                            />
                          </FormField>

                        </Box>
                        <Box basis={'1/2'} gap={columnGap}>
                          <FormField
                            label="NFT Deposit Address"
                            error={errors!.wallet_address}
                          >
                            <TextInput
                              name="wallet_address"
                              placeholder="Your NFT will be deposited into this Ethereum account"
                              value={values!.wallet_address}
                              onChange={handleChange}
                            />
                          </FormField>
                        </Box>
                      </Box>

                    </Box>
                    <Box gap={columnGap}>
                      <Box direction="row" gap={columnGap}>
                        <Box basis={'1/4'} gap={columnGap}>
                          <FormField
                            label="Currency"
                            error={errors!.currency}
                          >

                            <TextInput
                              disabled={true}
                              name="currency"
                              value={values!.currency}
                              onChange={handleChange}
                            />
                          </FormField>
                        </Box>
                        <Box basis={'1/4'} gap={columnGap}>
                          <FormField
                            label="Finance amount"
                            error={errors!.amount}
                          >
                            <TextInput
                              name="amount"
                              value={values!.amount}
                              onChange={handleChange}
                            />
                          </FormField>

                        </Box>
                        <Box basis={'1/4'} gap={columnGap}>
                          <FormField
                            label="APR, %"
                            error={errors!.apr}
                          >
                            <TextInput
                              disabled={true}
                              name="apr"
                              value={values!.apr}
                              onChange={handleChange}
                            />
                          </FormField>
                        </Box>
                        <Box basis={'1/4'} gap={columnGap}>
                          <FormField
                            label="Fee, %"
                            error={errors!.fee}
                          >
                            <TextInput
                              name="fee"
                              disabled={true}
                              value={values!.fee}
                              onChange={(ev) => {
                                handleChange(ev)
                              }}
                            />
                          </FormField>
                        </Box>
                      </Box>
                      <Box direction="row" gap={columnGap}>
                        <Box basis={'1/4'} gap={columnGap}>
                          <FormField
                            label="Repayment Due Date"
                            error={errors!.repayment_due_date}
                          >
                            <TextInput
                              disabled={true}
                              name="repayment_due_date"
                              type="date"
                              value={dateFormatter(values!.repayment_due_date)}
                              onChange={ev => {
                                setFieldValue('repayment_due_date', parseDate(ev.target.value));
                              }}
                            />
                          </FormField>
                        </Box>
                        <Box basis={'1/4'} gap={columnGap}>
                          <FormField
                            label="Repayment amount"
                            error={errors!.repayment_amount}
                          >
                            <TextInput
                              disabled={true}
                              name="repayment_amount"
                              value={values!.repayment_amount}
                              onChange={handleChange}
                            />
                          </FormField>
                        </Box>
                        <Box basis={'1/4'} gap={columnGap}>

                        </Box>
                        <Box basis={'1/4'} gap={columnGap}>

                        </Box>
                      </Box>
                    </Box>

                  </Box>
                  <Box direction="row" justify={'end'} gap="medium">
                    <Button
                      onClick={this.onDiscard}
                      label="Discard"
                    />

                    <Button
                      type="submit"
                      primary
                      label="Send"
                    />
                  </Box>
                </form>
              );
            }
          }
        </Formik>
      </Box>
    );

  }
}

