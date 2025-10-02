// Shared query builder for mock models to emulate Mongoose chainable queries
class MockQueryBuilder {
  constructor(model, data) {
    this.model = model;
    this.data = data;
    this.filters = {};
    this.sortOptions = {};
    this.limitValue = null;
    this.skipValue = 0;
    this.selectFields = null;
    this.populateOptions = null;
  }

  // Chainable methods
  sort(options) {
    this.sortOptions = options;
    return this;
  }

  limit(value) {
    this.limitValue = value;
    return this;
  }

  skip(value) {
    this.skipValue = value;
    return this;
  }

  select(fields) {
    this.selectFields = fields;
    return this;
  }

  populate(options) {
    this.populateOptions = options;
    return this;
  }

  where(conditions) {
    Object.assign(this.filters, conditions);
    return this;
  }

  // Execute the query
  async exec() {
    let result = [...this.data];

    // Apply filters
    Object.keys(this.filters).forEach((key) => {
      const value = this.filters[key];
      result = result.filter((item) => {
        if (value && typeof value === 'object' && value.$in) {
          return value.$in.includes(item[key]);
        }
        return item[key] === value;
      });
    });

    // Apply sorting
    if (Object.keys(this.sortOptions).length > 0) {
      result.sort((a, b) => {
        for (const [key, order] of Object.entries(this.sortOptions)) {
          const aVal = a[key];
          const bVal = b[key];

          if (aVal < bVal) return order === 1 ? -1 : 1;
          if (aVal > bVal) return order === 1 ? 1 : -1;
        }
        return 0;
      });
    }

    // Apply skip
    if (this.skipValue > 0) {
      result = result.slice(this.skipValue);
    }

    // Apply limit
    if (this.limitValue !== null && this.limitValue > 0) {
      result = result.slice(0, this.limitValue);
    }

    // Apply field selection (simplified)
    if (this.selectFields) {
      const fields = this.selectFields.split(' ').filter((f) => !f.startsWith('-'));
      if (fields.length > 0) {
        result = result.map((item) => {
          const selected = {};
          fields.forEach((field) => {
            if (item[field] !== undefined) {
              selected[field] = item[field];
            }
          });
          return selected;
        });
      }
    }

    return result;
  }

  // Make it thenable (Promise-like)
  then(resolve, reject) {
    return this.exec().then(resolve, reject);
  }

  catch(reject) {
    return this.exec().catch(reject);
  }
}

module.exports = MockQueryBuilder;
