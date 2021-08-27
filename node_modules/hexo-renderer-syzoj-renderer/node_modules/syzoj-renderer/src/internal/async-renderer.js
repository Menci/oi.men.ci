import UUID from 'uuid';

export default class AsyncRenderer {
  constructor(cache, callbackAddReplace) {
    this.cache = cache;
    this.callbackAddReplace = callbackAddReplace;
    this.tasks = [];
  }

  _generateUUID(uuidGenerator) {
    return uuidGenerator();
  }

  _addRenderTask(task) {
    const uuid = this._generateUUID(UUID);
    this.tasks.push({
      uuid: uuid,
      task: task
    });
    return uuid;
  }

  async doRender(callbackCheckFiltered) {
    await Promise.all(this.tasks.filter(task => !callbackCheckFiltered(task.uuid))
                                .map(async task => this.callbackAddReplace(task.uuid, await this._doRender(task.task))));
  }
}
