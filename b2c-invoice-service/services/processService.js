const objectModel = require('../models/objectModel');
const Template = require('../models/Template');
// const { generatePDF } = require('./pdfService');

/**
 * Process logic that gets triggered when Kafka message is received
 */
const processTriggeredByMessage = async (order_number) => {
  // For this example, we'll process all documents or a specific one if needed
  const allObjects = await objectModel.find();

  const results = [];

  for (const mainObj of allObjects) {
    try {
      const template = await Template.findOne({ name: 'default' });

      // const pdfPath = generatePDF(mainObj, template, `${mainObj.identifier}.pdf`);

      results.push({
        status: 'success',
        identifier: mainObj.identifier,
        pdfPath
      });
    } catch (err) {
      console.error(`Error processing object ${mainObj.identifier}:`, err.message);
      results.push({
        status: 'failed',
        identifier: mainObj.identifier,
        error: err.message
      });
    }
  }

  return results;
};

module.exports = { processTriggeredByMessage };
