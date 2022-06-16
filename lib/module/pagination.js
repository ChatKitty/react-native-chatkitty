import { ChatKittyError } from './error';
export class ChatKittyPaginator {
  static async createInstance(request) {
    const page = await new Promise((resolve, reject) => {
      request.stompX.relayResource({
        destination: request.relay,
        parameters: request.parameters,
        onSuccess: resource => resolve(resource),
        onError: error => reject(error)
      });
    });
    let items = [];

    if (page._embedded) {
      items = page._embedded[request.contentName];
    }

    const mapper = request.mapper;
    const asyncMapper = request.asyncMapper;

    if (mapper) {
      items = items.map(item => mapper(item));
    } else if (asyncMapper) {
      const mappedItems = [];

      for (const item of items) {
        mappedItems.concat(await asyncMapper(item));
      }

      items = mappedItems;
    }

    return new ChatKittyPaginator(items, request.stompX, request.contentName, page._relays.prev, page._relays.next, request.parameters, mapper, asyncMapper);
  }

  constructor(items, stompX, contentName, prevRelay, nextRelay, parameters, mapper, asyncMapper) {
    this.items = items;
    this.stompX = stompX;
    this.contentName = contentName;
    this.prevRelay = prevRelay;
    this.nextRelay = nextRelay;
    this.parameters = parameters;
    this.mapper = mapper;
    this.asyncMapper = asyncMapper;
  }

  get hasPrevPage() {
    return !!this.prevRelay;
  }

  get hasNextPage() {
    return !!this.nextRelay;
  }

  async prevPage() {
    return this.getPage(this.prevRelay);
  }

  async nextPage() {
    return this.getPage(this.nextRelay);
  }

  async getPage(relay) {
    const page = await new Promise((resolve, reject) => {
      if (relay) {
        this.stompX.relayResource({
          destination: relay,
          parameters: this.parameters,
          onSuccess: resource => resolve(resource),
          onError: error => reject(error)
        });
      } else {
        reject(new PageOutOfBoundsError());
      }
    });
    let items = [];

    if (page._embedded) {
      items = page._embedded[this.contentName];
    }

    const mapper = this.mapper;
    const asyncMapper = this.asyncMapper;

    if (mapper) {
      items = items.map(item => mapper(item));
    } else if (asyncMapper) {
      const mappedItems = [];

      for (const item of items) {
        mappedItems.concat(await asyncMapper(item));
      }

      items = mappedItems;
    }

    return new ChatKittyPaginator(items, this.stompX, this.contentName, page._relays.prev, page._relays.next, this.parameters, this.mapper, this.asyncMapper);
  }

}
export class PageOutOfBoundsError extends ChatKittyError {
  constructor() {
    super('PageOutOfBoundsError', "You've requested a page that doesn't exists.");
  }

}
//# sourceMappingURL=pagination.js.map